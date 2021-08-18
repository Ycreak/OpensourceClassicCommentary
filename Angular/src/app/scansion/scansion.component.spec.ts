import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScansionComponent } from './scansion.component';

describe('ScansionComponent', () => {
  let component: ScansionComponent;
  let fixture: ComponentFixture<ScansionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScansionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScansionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
