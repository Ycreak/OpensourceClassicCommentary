import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Lesson, LessonSummary } from './lesson.model';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  constructor(private http: HttpClient) {}

  public load_index(): Observable<LessonSummary[]> {
    return this.http.get<LessonSummary[]>('assets/teaching/index.json');
  }

  public load_lesson(id: string): Observable<Lesson> {
    return this.http.get<Lesson>(`assets/teaching/${id}.json`);
  }
}
