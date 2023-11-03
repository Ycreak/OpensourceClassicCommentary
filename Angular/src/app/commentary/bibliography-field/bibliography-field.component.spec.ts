import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BibliographyFieldComponent } from './bibliography-field.component';

describe('BibliographyFieldComponent', () => {
  let component: BibliographyFieldComponent;
  let fixture: ComponentFixture<BibliographyFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BibliographyFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BibliographyFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
