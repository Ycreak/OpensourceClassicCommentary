import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinPlaygroundComponent } from './join-playground.component';

describe('JoinPlaygroundComponent', () => {
  let component: JoinPlaygroundComponent;
  let fixture: ComponentFixture<JoinPlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JoinPlaygroundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
