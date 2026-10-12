import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { WYSIWYGDialogComponent } from './wysiwyg-dialog.component';

describe('WYSIWYGDialogComponent', () => {
  let component: WYSIWYGDialogComponent;
  let fixture: ComponentFixture<WYSIWYGDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WYSIWYGDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WYSIWYGDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
