import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ColumnBibliographyComponent } from './column-bibliography.component';

describe('ColumnBibliographyComponent', () => {
  let component: ColumnBibliographyComponent;
  let fixture: ComponentFixture<ColumnBibliographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnBibliographyComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnBibliographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
