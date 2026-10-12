import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterService } from '../../../services/filter.service';

import { TestimoniaTableComponent } from './testimonia-table.component';

describe('TestimoniaTableComponent', () => {
  let component: TestimoniaTableComponent;
  let fixture: ComponentFixture<TestimoniaTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimoniaTableComponent],
    }).compileComponents();

    // The component constructor expects FilterService.data to be initialised.
    TestBed.inject(FilterService).init();
    fixture = TestBed.createComponent(TestimoniaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
