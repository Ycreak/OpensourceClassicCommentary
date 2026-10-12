import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralCommentaryFieldComponent } from './general-commentary-field.component';

describe('GeneralCommentaryFieldComponent', () => {
  let component: GeneralCommentaryFieldComponent;
  let fixture: ComponentFixture<GeneralCommentaryFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralCommentaryFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralCommentaryFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', '');
    fixture.componentRef.setInput('title', 'Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
