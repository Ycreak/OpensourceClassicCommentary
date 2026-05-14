// Library imports
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogClose,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { NgIf, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

// Service imports
import { LessonService } from '../lesson.service';
import { LessonSummary } from '../lesson.model';

@Component({
  selector: 'app-start-lesson',
  templateUrl: './start-lesson.component.html',
  styleUrls: ['./start-lesson.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogClose,
    MatIconModule,
    MatDialogContent,
    MatDialogActions,
    MatListModule,
    NgIf,
    NgFor,
  ],
})
export class StartLessonComponent implements OnInit {
  protected lessons: LessonSummary[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<StartLessonComponent>,
    protected lesson_service: LessonService
  ) {}

  ngOnInit(): void {
    this.lesson_service.load_index().subscribe((lessons: LessonSummary[]) => {
      this.lessons = lessons;
    });
  }

  protected select_lesson(lesson: LessonSummary): void {
    this.dialogRef.close(lesson.id);
  }

  protected onNoClick(): void {
    this.dialogRef.close(null);
  }
}
