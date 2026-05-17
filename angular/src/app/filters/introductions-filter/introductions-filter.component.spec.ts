import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductionsFilterComponent } from './introductions-filter.component';

describe('IntroductionsFilterComponent', () => {
  let component: IntroductionsFilterComponent;
  let fixture: ComponentFixture<IntroductionsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroductionsFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IntroductionsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
