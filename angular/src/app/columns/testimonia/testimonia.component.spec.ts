import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimoniaComponent } from './testimonia.component';

describe('TestimoniaComponent', () => {
  let component: TestimoniaComponent;
  let fixture: ComponentFixture<TestimoniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestimoniaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimoniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
