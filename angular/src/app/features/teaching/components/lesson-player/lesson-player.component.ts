import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

import { Lesson, MultipleChoiceQuestion } from '@oscc/features/teaching/models/lesson.model';

interface QuestionState {
  selected: number | null;
  /** Whether the current selection has been checked and feedback is shown. */
  checked: boolean;
  /** Result of the most recent check. */
  last_correct: boolean;
  /** Result of the first check, used for scoring. Null until first check. */
  correct_on_first_try: boolean | null;
}

/** Runs a multiple-choice lesson: one question at a time, with feedback and a final score. */
@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatRadioModule],
  templateUrl: './lesson-player.component.html',
  styleUrls: ['./lesson-player.component.scss'],
})
export class LessonPlayerComponent {
  protected index = 0;
  protected finished = false;
  protected states: QuestionState[];

  constructor(@Inject(MAT_DIALOG_DATA) protected lesson: Lesson) {
    this.states = lesson.questions.map(() => ({
      selected: null,
      checked: false,
      last_correct: false,
      correct_on_first_try: null,
    }));
  }

  protected get question(): MultipleChoiceQuestion {
    return this.lesson.questions[this.index];
  }

  protected get state(): QuestionState {
    return this.states[this.index];
  }

  protected get total(): number {
    return this.lesson.questions.length;
  }

  protected get score(): number {
    return this.states.filter((s) => s.correct_on_first_try).length;
  }

  /** A correctly answered question is locked; wrong answers can be retried. */
  protected get locked(): boolean {
    return this.state.checked && this.state.last_correct;
  }

  protected get show_hint(): boolean {
    return this.state.checked && !this.state.last_correct;
  }

  protected get show_explanation(): boolean {
    return this.state.checked && this.state.last_correct;
  }

  protected select(choice_index: number): void {
    if (this.locked) {
      return;
    }
    this.state.selected = choice_index;
    // Clear previous feedback until the new selection is checked.
    this.state.checked = false;
  }

  protected check(): void {
    if (this.state.selected === null) {
      return;
    }
    const correct = this.state.selected === this.question.correct_index;
    if (this.state.correct_on_first_try === null) {
      this.state.correct_on_first_try = correct;
    }
    this.state.last_correct = correct;
    this.state.checked = true;
  }

  protected next(): void {
    if (this.index < this.total - 1) {
      this.index += 1;
    } else {
      this.finished = true;
    }
  }
}
