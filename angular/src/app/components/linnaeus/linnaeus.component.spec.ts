import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinnaeusComponent } from './linnaeus.component';

describe('LinnaeusComponent', () => {
  let component: LinnaeusComponent;
  let fixture: ComponentFixture<LinnaeusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinnaeusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LinnaeusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
