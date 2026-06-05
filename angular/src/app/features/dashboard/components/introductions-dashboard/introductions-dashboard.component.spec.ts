import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimoniaDashboardComponent } from './testimonia-dashboard.component';

describe('TestimoniaDashboardComponent', () => {
  let component: TestimoniaDashboardComponent;
  let fixture: ComponentFixture<TestimoniaDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimoniaDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimoniaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
