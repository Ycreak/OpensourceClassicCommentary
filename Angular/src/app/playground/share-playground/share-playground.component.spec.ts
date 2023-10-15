import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePlaygroundComponent } from './share-playground.component';

describe('SharePlaygroundComponent', () => {
  let component: SharePlaygroundComponent;
  let fixture: ComponentFixture<SharePlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SharePlaygroundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
