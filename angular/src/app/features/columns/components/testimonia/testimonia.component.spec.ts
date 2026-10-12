import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Testimonium } from '@oscc/types/Testimonium';

import { TestimoniaComponent } from './testimonia.component';

describe('TestimoniaComponent', () => {
  let component: TestimoniaComponent;
  let fixture: ComponentFixture<TestimoniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimoniaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimoniaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('testimonium', new Testimonium());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
