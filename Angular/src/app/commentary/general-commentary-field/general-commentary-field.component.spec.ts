import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralCommentaryFieldComponent } from './general-commentary-field.component';

describe('GeneralCommentaryFieldComponent', () => {
  let component: GeneralCommentaryFieldComponent;
  let fixture: ComponentFixture<GeneralCommentaryFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralCommentaryFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralCommentaryFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
