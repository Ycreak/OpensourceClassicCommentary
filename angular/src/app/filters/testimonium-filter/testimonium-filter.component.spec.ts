import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimoniumFilterComponent } from './testimonium-filter.component';

describe('TestimoniumFilterComponent', () => {
  let component: TestimoniumFilterComponent;
  let fixture: ComponentFixture<TestimoniumFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimoniumFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimoniumFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
