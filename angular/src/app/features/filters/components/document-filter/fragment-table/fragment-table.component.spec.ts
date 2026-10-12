import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterService } from '../../../services/filter.service';

import { FragmentTableComponent } from './fragment-table.component';

describe('FragmentTableComponent', () => {
  let component: FragmentTableComponent;
  let fixture: ComponentFixture<FragmentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FragmentTableComponent],
    }).compileComponents();

    // The component constructor expects FilterService.data to be initialised.
    TestBed.inject(FilterService).init();
    fixture = TestBed.createComponent(FragmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
