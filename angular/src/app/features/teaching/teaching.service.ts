import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Lesson, LessonSummary } from '@oscc/features/teaching/models/lesson.model';

/** Loads teaching-package lessons from the committed JSON files under assets/teaching/. */
@Injectable({ providedIn: 'root' })
export class TeachingService {
  constructor(private http: HttpClient) {}

  /** List of available lessons (assets/teaching/index.json). */
  public get_lessons(): Observable<LessonSummary[]> {
    return this.http.get<LessonSummary[]>('assets/teaching/index.json');
  }

  /** A single lesson by id (assets/teaching/{id}.json). */
  public get_lesson(id: string): Observable<Lesson> {
    return this.http.get<Lesson>(`assets/teaching/${id}.json`);
  }
}
