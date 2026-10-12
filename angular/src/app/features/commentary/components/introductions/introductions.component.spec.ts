import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IntroductionsComponent } from './introductions.component';

describe('IntroductionsComponent', () => {
  let component: IntroductionsComponent;
  let fixture: ComponentFixture<IntroductionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroductionsComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IntroductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
