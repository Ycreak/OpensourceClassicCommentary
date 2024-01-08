import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavePlaygroundComponent } from './save-playground.component';

describe('SavePlaygroundComponent', () => {
  let component: SavePlaygroundComponent;
  let fixture: ComponentFixture<SavePlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavePlaygroundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SavePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
