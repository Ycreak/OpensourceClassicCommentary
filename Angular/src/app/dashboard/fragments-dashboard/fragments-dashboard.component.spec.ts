import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FragmentsDashboardComponent } from './fragments-dashboard.component';

describe('FragmentsDashboardComponent', () => {
  let component: FragmentsDashboardComponent;
  let fixture: ComponentFixture<FragmentsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FragmentsDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FragmentsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
