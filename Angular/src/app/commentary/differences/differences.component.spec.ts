import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifferencesComponent } from './differences.component';

describe('DifferencesComponent', () => {
  let component: DifferencesComponent;
  let fixture: ComponentFixture<DifferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DifferencesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DifferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
