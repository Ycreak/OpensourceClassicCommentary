import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatinTragicFragmentFilterComponent } from './latin-tragic-fragment-filter.component';

describe('LatinTragicFragmentFilterComponent', () => {
  let component: LatinTragicFragmentFilterComponent;
  let fixture: ComponentFixture<LatinTragicFragmentFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatinTragicFragmentFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LatinTragicFragmentFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
