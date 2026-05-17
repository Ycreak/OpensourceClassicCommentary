import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LessonCanvasService } from './lesson-canvas.service';
import { LessonService } from './lesson.service';
import { Lesson } from './lesson.model';
import { LessonSummaryComponent } from './lesson-summary/lesson-summary.component';
import { StartLessonComponent } from './start-lesson/start-lesson.component';
import { TeachingFabricService } from './teaching-fabric.service';

@Injectable({
  providedIn: 'root',
})
export class TeachingPlaygroundService {
  public lesson_mode = false;
  public current_lesson: Lesson | null = null;
  public current_step_index = 0;
  public step_scores: { correct: number; total: number; misplaced: number }[] = [];
  public step_checked = false;

  constructor(
    private lesson_canvas: LessonCanvasService,
    private lesson_service: LessonService,
    private mat_dialog: MatDialog,
    private teaching_fabric: TeachingFabricService
  ) {}

  public start_lesson(): void {
    const dialogRef = this.mat_dialog.open(StartLessonComponent, { data: {} });
    dialogRef.afterClosed().subscribe({
      next: (lesson_id: string | null) => {
        if (!lesson_id) return;
        this.lesson_service.load_lesson(lesson_id).subscribe({
          next: (lesson: Lesson) => {
            this.current_lesson = lesson;
            this.lesson_mode = true;
            this.current_step_index = 0;
            this.step_scores = [];
            this.step_checked = false;
            this.lesson_canvas.load_for_lesson(lesson).subscribe({
              next: (result) => {
                if (!result.ok) {
                  this.exit_lesson();
                  return;
                }
                this.enter_step(0);
              },
            });
          },
        });
      },
    });
  }

  public check_step(): void {
    if (!this.current_lesson) return;
    const step = this.current_lesson.steps[this.current_step_index];
    const results = this.teaching_fabric.evaluate_step(step.zones);
    this.teaching_fabric.apply_feedback(results);
    const target_results = results.filter((r) => r.should_zone_label !== null);
    const correct = target_results.filter((r) => r.is_correct).length;
    const misplaced = results.filter(
      (r) => r.should_zone_label === null && r.placed_zone_label !== null
    ).length;
    this.step_scores[this.current_step_index] = { correct, total: target_results.length, misplaced };
    this.step_checked = true;
  }

  public next_step(): void {
    if (!this.current_lesson) return;
    if (this.current_step_index + 1 < this.current_lesson.steps.length) {
      this.current_step_index++;
      this.enter_step(this.current_step_index);
    } else {
      this.end_lesson();
    }
  }

  /**
   * Input guard: returns false while a lesson is active so host-level
   * keybindings (e.g. the Delete key on PlaygroundComponent) cannot mutate
   * the canvas mid-lesson. Lives here so PlaygroundComponent does not need
   * to know about teaching-specific invariants.
   */
  public can_delete(): boolean {
    return !this.lesson_mode;
  }

  public exit_lesson(): void {
    this.lesson_mode = false;
    this.current_lesson = null;
    this.current_step_index = 0;
    this.step_scores = [];
    this.step_checked = false;
    this.lesson_canvas.clear();
  }

  public get current_prompt(): string {
    if (!this.current_lesson) return '';
    return this.current_lesson.steps[this.current_step_index]?.prompt ?? '';
  }

  public get total_steps(): number {
    return this.current_lesson?.steps.length ?? 0;
  }

  public get current_explanation(): string {
    if (!this.current_lesson) return '';
    return this.current_lesson.steps[this.current_step_index]?.explanation ?? '';
  }

  public get current_step_score(): { correct: number; total: number; misplaced: number } | null {
    return this.step_scores[this.current_step_index] ?? null;
  }

  private enter_step(i: number): void {
    if (!this.current_lesson) return;
    this.step_checked = false;
    this.lesson_canvas.prepare_step(this.current_lesson.steps[i]);
  }

  private end_lesson(): void {
    if (!this.current_lesson) return;
    const dialogRef = this.mat_dialog.open(LessonSummaryComponent, {
      data: {
        lesson_title: this.current_lesson.title,
        step_scores: this.step_scores,
      },
    });
    dialogRef.afterClosed().subscribe({
      next: (action: string) => {
        this.exit_lesson();
        if (action === 'restart_list') {
          this.start_lesson();
        }
      },
    });
  }
}
