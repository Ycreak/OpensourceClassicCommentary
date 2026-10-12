import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Fragment } from '@oscc/types/Fragment';

import { FragmentComponent } from './fragment.component';

describe('FragmentComponent', () => {
  let component: FragmentComponent;
  let fixture: ComponentFixture<FragmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FragmentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FragmentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fragment', new Fragment());
    fixture.componentRef.setInput('translated', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
