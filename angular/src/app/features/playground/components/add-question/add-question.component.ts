// Library imports
import { Component } from '@angular/core';
import { MatDialogRef, MatDialogClose, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

// Model imports
import { Playground_question } from '@oscc/features/playground/types/Playground_question';

/**
 * Dialog to compose a multiple choice question. Returns a valid Playground_question
 * on close, or nothing when cancelled.
 */
@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogClose,
    MatIconModule,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatDialogActions,
  ],
})
export class AddQuestionComponent {
  protected readonly min_choices = 2;
  protected readonly max_choices = 6;

  protected form: FormGroup;

  constructor(
    private form_builder: FormBuilder,
    public dialogRef: MatDialogRef<AddQuestionComponent>
  ) {
    this.form = this.form_builder.group({
      question: new FormControl('', [Validators.required, this.no_whitespace_validator]),
      choices: this.form_builder.array([this.build_choice(), this.build_choice(), this.build_choice(), this.build_choice()]),
      correct_index: new FormControl<number | null>(null, Validators.required),
      explanation: new FormControl(''),
    });
  }

  protected get choices(): FormArray {
    return this.form.get('choices') as FormArray;
  }

  /**
   * Returns the label for the choice at the given index, e.g. 'a)'
   * @param index (number) of the choice
   * @return string
   */
  protected choice_label(index: number): string {
    return `${String.fromCharCode(97 + index)})`;
  }

  protected add_choice(): void {
    if (this.choices.length < this.max_choices) {
      this.choices.push(this.build_choice());
    }
  }

  /**
   * Removes the choice at the given index and keeps the selected correct answer
   * pointing at the same choice.
   * @param index (number) of the choice to remove
   */
  protected remove_choice(index: number): void {
    if (this.choices.length <= this.min_choices) {
      return;
    }
    this.choices.removeAt(index);
    const correct_control = this.form.get('correct_index');
    const correct_index = correct_control.value;
    if (correct_index === index) {
      correct_control.setValue(null);
    } else if (correct_index !== null && correct_index > index) {
      correct_control.setValue(correct_index - 1);
    }
  }

  /**
   * Validates the form and closes the dialog with the composed question
   */
  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const question = new Playground_question({
      question: this.form.value.question.trim(),
      choices: this.form.value.choices.map((choice: string) => choice.trim()),
      correct_index: this.form.value.correct_index,
      explanation: this.form.value.explanation ? this.form.value.explanation.trim() : '',
    });
    this.dialogRef.close(question);
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }

  private build_choice(): FormControl {
    return new FormControl('', [Validators.required, this.no_whitespace_validator]);
  }

  private no_whitespace_validator(control: FormControl): { [key: string]: boolean } | null {
    return typeof control.value === 'string' && control.value.trim().length === 0 && control.value.length > 0
      ? { whitespace: true }
      : null;
  }
}
