import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishDashboardComponent } from './publish-dashboard.component';

describe('PublishDashboardComponent', () => {
  let component: PublishDashboardComponent;
  let fixture: ComponentFixture<PublishDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
