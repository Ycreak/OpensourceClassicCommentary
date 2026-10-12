import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DeletePlaygroundComponent } from './delete-playground.component';

describe('DeletePlaygroundComponent', () => {
  let component: DeletePlaygroundComponent;
  let fixture: ComponentFixture<DeletePlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePlaygroundComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
