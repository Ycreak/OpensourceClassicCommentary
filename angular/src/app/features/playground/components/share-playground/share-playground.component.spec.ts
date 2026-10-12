import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SharePlaygroundComponent } from './share-playground.component';

describe('SharePlaygroundComponent', () => {
  let component: SharePlaygroundComponent;
  let fixture: ComponentFixture<SharePlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharePlaygroundComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { users: [] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
