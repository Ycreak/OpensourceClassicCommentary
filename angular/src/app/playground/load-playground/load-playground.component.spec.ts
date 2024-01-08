import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadPlaygroundComponent } from './load-playground.component';

describe('LoadPlaygroundComponent', () => {
  let component: LoadPlaygroundComponent;
  let fixture: ComponentFixture<LoadPlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadPlaygroundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
