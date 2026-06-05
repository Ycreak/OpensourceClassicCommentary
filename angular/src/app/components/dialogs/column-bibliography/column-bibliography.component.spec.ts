import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnBibliographyComponent } from './column-bibliography.component';

describe('ColumnBibliographyComponent', () => {
  let component: ColumnBibliographyComponent;
  let fixture: ComponentFixture<ColumnBibliographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnBibliographyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnBibliographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
