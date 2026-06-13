import { Component, OnInit, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TeachingService } from '@oscc/features/teaching/teaching.service';
import { LessonSummary } from '@oscc/features/teaching/models/lesson.model';

/** Lets the student pick a lesson. Closes with the chosen lesson id (or undefined).
 * The app runs zoneless change detection, so async results are held in signals. */
@Component({
  selector: 'app-select-lesson-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './select-lesson-dialog.component.html',
  styleUrls: ['./select-lesson-dialog.component.scss'],
})
export class SelectLessonDialogComponent implements OnInit {
  protected lessons = signal<LessonSummary[]>([]);
  protected loading = signal(true);
  protected failed = signal(false);

  constructor(
    public dialogRef: MatDialogRef<SelectLessonDialogComponent, string>,
    private teaching: TeachingService
  ) {}

  ngOnInit(): void {
    this.teaching.get_lessons().subscribe({
      next: (lessons) => {
        this.lessons.set(lessons);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }

  protected select(id: string): void {
    this.dialogRef.close(id);
  }
}
