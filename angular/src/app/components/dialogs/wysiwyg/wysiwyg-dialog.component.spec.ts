import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WYSIWYGDialogComponent } from './wysiwyg-dialog.component';

describe('WYSIWYGDialogComponent', () => {
  let component: WYSIWYGDialogComponent;
  let fixture: ComponentFixture<WYSIWYGDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WYSIWYGDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WYSIWYGDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
