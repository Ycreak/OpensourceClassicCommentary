import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricalAnalysisFieldComponent } from './metrical-analysis-field.component';

describe('MetricalAnalysisFieldComponent', () => {
  let component: MetricalAnalysisFieldComponent;
  let fixture: ComponentFixture<MetricalAnalysisFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetricalAnalysisFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricalAnalysisFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
