import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableTextComponent } from './expandable-text.component';

describe('ExpandableTextComponent', () => {
  let component: ExpandableTextComponent;
  let fixture: ComponentFixture<ExpandableTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandableTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableTextComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', '<p>test</p>');
    fixture.componentRef.setInput('collapsedHeightPx', 40);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
