import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SavePlaygroundComponent } from './save-playground.component';

describe('SavePlaygroundComponent', () => {
  let component: SavePlaygroundComponent;
  let fixture: ComponentFixture<SavePlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavePlaygroundComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SavePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
