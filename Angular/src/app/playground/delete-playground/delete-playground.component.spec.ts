import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePlaygroundComponent } from './delete-playground.component';

describe('DeletePlaygroundComponent', () => {
  let component: DeletePlaygroundComponent;
  let fixture: ComponentFixture<DeletePlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeletePlaygroundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
