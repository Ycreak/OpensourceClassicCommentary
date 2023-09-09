import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Playground2Component } from './playground2.component';

describe('Playground2Component', () => {
  let component: Playground2Component;
  let fixture: ComponentFixture<Playground2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Playground2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Playground2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
