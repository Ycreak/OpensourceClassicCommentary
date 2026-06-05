import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimoniaTableComponent } from './testimonia-table.component';

describe('TestimoniaTableComponent', () => {
  let component: TestimoniaTableComponent;
  let fixture: ComponentFixture<TestimoniaTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimoniaTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimoniaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
