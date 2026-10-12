import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationComponent } from './translation.component';

describe('TranslationComponent', () => {
  let component: TranslationComponent;
  let fixture: ComponentFixture<TranslationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('document', {
      commentary: { fields: { translation: '' } },
      lines: [],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
