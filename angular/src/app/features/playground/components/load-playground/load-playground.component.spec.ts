import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LoadPlaygroundComponent } from './load-playground.component';

describe('LoadPlaygroundComponent', () => {
  let component: LoadPlaygroundComponent;
  let fixture: ComponentFixture<LoadPlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadPlaygroundComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
