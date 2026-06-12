import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductionsDashboardComponent } from './introductions-dashboard.component';

describe('IntroductionsDashboardComponent', () => {
  let component: IntroductionsDashboardComponent;
  let fixture: ComponentFixture<IntroductionsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroductionsDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IntroductionsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
