// Library imports
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { NgIf, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface StepScore {
  correct: number;
  total: number;
  misplaced: number;
}

interface LessonSummaryDialogData {
  lesson_title: string;
  step_scores: StepScore[];
}

@Component({
  selector: 'app-lesson-summary',
  templateUrl: './lesson-summary.component.html',
  styleUrls: ['./lesson-summary.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    MatDialogActions,
    NgIf,
    NgFor,
  ],
})
export class LessonSummaryComponent {
  protected lesson_title: string;
  protected step_scores: StepScore[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: LessonSummaryDialogData,
    public dialogRef: MatDialogRef<LessonSummaryComponent>
  ) {
    this.lesson_title = dialog_data.lesson_title;
    this.step_scores = dialog_data.step_scores;
  }

  protected get total_correct(): number {
    return this.step_scores.reduce((sum, s) => sum + s.correct, 0);
  }

  protected get total_total(): number {
    return this.step_scores.reduce((sum, s) => sum + s.total, 0);
  }

  protected step_label(score: StepScore): string {
    return score.correct === score.total && score.misplaced === 0 ? 'GOED' : 'FOUT';
  }

  protected restart_list(): void {
    this.dialogRef.close('restart_list');
  }

  protected close_summary(): void {
    this.dialogRef.close('close');
  }
}
