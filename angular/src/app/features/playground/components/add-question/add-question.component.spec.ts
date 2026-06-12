import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AddQuestionComponent } from './add-question.component';
import { Playground_question } from '@oscc/features/playground/types/Playground_question';

describe('AddQuestionComponent', () => {
  let component: AddQuestionComponent;
  let fixture: ComponentFixture<AddQuestionComponent>;
  let dialog_ref: jasmine.SpyObj<MatDialogRef<AddQuestionComponent>>;

  beforeEach(async () => {
    dialog_ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [AddQuestionComponent],
      providers: [provideNoopAnimations(), { provide: MatDialogRef, useValue: dialog_ref }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not close the dialog when the form is invalid', () => {
    (component as any).submit();
    expect(dialog_ref.close).not.toHaveBeenCalled();
  });

  it('should close with a valid question when the form is filled in', () => {
    const form = (component as any).form;
    form.get('question').setValue('What form would we expect in Classical Latin?');
    form.get('choices').setValue(['ipsi', 'ipso', 'ipsa', 'ipse']);
    form.get('correct_index').setValue(3);
    (component as any).submit();

    expect(dialog_ref.close).toHaveBeenCalled();
    const question = dialog_ref.close.calls.mostRecent().args[0];
    expect(Playground_question.is_valid(question)).toBeTrue();
    expect(question.correct_index).toBe(3);
  });

  it('should keep the correct answer pointing at the same choice when removing one above it', () => {
    const form = (component as any).form;
    form.get('correct_index').setValue(3);
    (component as any).remove_choice(0);
    expect(form.get('correct_index').value).toBe(2);
  });

  it('should reset the correct answer when the chosen choice is removed', () => {
    const form = (component as any).form;
    form.get('correct_index').setValue(1);
    (component as any).remove_choice(1);
    expect(form.get('correct_index').value).toBeNull();
  });
});
