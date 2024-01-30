import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFilterComponent } from './document-filter.component';

describe('DocumentFilterComponent', () => {
  let component: DocumentFilterComponent;
  let fixture: ComponentFixture<DocumentFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
