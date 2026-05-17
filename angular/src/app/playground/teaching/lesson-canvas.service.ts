import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { FabricService } from '../services/fabric.service';
import { FormatterService } from '../services/formatter.service';
import { Lesson, LessonStep } from './lesson.model';
import { TeachingFabricService } from './teaching-fabric.service';

/**
 * Result of loading a lesson's fragment pools onto the canvas. `ok` is false
 * when the lesson cannot be staged (no pools declared, or no matching
 * documents returned from the API); callers should bail out in that case.
 */
export interface LoadLessonResult {
  ok: boolean;
}

/**
 * Operational adapter between a Lesson and the fabric canvas. Owns the
 * per-step plumbing — pool sampling, document formatting, scatter, zone
 * placement, and cleanup — plus the lifecycle of the sampled-documents
 * cache. The TeachingPlaygroundService delegates here so it can stay a
 * thin state machine over lesson_mode / current_step_index / scores.
 */
@Injectable({
  providedIn: 'root',
})
export class LessonCanvasService {
  /**
   * Documents sampled from the current lesson's fragment pools. Refreshed
   * by load_for_lesson and cleared by clear(); kept here (not on the
   * teaching service) so its lifecycle is owned by the same module that
   * decides when it is valid.
   */
  private lesson_documents: any[] = [];

  constructor(
    private api: ApiService,
    private fabric: FabricService,
    private formatter: FormatterService,
    private teaching_fabric: TeachingFabricService,
    private utility: UtilityService
  ) {}

  /**
   * Samples and formats fragments from the lesson's pools, caching the
   * result for subsequent prepare_step calls. Emits a single result
   * describing whether the lesson is ready to be staged; on failure the
   * adapter has already surfaced a snackbar message to the user.
   */
  public load_for_lesson(lesson: Lesson): Observable<LoadLessonResult> {
    if (lesson.fragment_pools.length === 0) {
      this.utility.open_snackbar('Lesson has no fragment pools.');
      return of({ ok: false });
    }
    const calls = lesson.fragment_pools.map((pool) =>
      this.api.request_documents({ ...pool.criterion, document_type: 'fragment', visible: 1 })
    );
    return forkJoin(calls).pipe(
      map((results: any[]) => {
        const all_docs: any[] = [];
        results.forEach((docs: any[], i: number) => {
          if (!docs || docs.length === 0) return;
          const pool = lesson.fragment_pools[i];
          const shuffled = [...docs].sort(() => Math.random() - 0.5);
          const sampled = shuffled.slice(0, pool.count);
          sampled.forEach((doc) => {
            this.formatter.format(doc);
            all_docs.push(doc);
          });
        });
        if (all_docs.length === 0) {
          this.utility.open_snackbar('No matching fragments returned by the server.');
          return { ok: false };
        }
        this.lesson_documents = all_docs;
        return { ok: true };
      })
    );
  }

  /**
   * Stages a lesson step: resets canvas/zones/feedback, re-adds the cached
   * lesson documents, draws the step's drop-zones, and scatters the
   * documents around them. Assumes load_for_lesson has populated the cache.
   */
  public prepare_step(step: LessonStep): void {
    this.teaching_fabric.clear_zones();
    this.teaching_fabric.clear_feedback();
    this.fabric.clear();
    this.fabric.add(this.lesson_documents);
    this.teaching_fabric.add_zones(step.zones);
    this.teaching_fabric.scatter_around_zones(step.zones);
  }

  /**
   * Tears down all lesson-canvas state: drops the sampled-documents cache
   * and wipes zones, feedback, and canvas contents. Safe to call before a
   * lesson has been loaded.
   */
  public clear(): void {
    this.lesson_documents = [];
    this.teaching_fabric.clear_zones();
    this.teaching_fabric.clear_feedback();
    this.fabric.clear();
  }
}
