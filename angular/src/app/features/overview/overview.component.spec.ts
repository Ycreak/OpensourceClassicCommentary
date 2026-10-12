import { ComponentFixture, TestBed } from '@angular/core/testing';

// The overview renders <app-playground>, which builds a FabricJS canvas directly.
// jsdom has no 2d canvas context, so the module is replaced with a stand-in.
vi.mock('fabric', () => ({
  Canvas: class {
    clear() {}
    loadFromJSON() {
      return Promise.resolve();
    }
    renderAll() {}
    add() {}
    on() {}
    getObjects() {
      return [];
    }
    setBackgroundColor() {}
  },
  Group: class {},
  Text: class {},
  Textbox: class {},
  IText: class {},
  Rect: class {},
  Point: class {},
  util: {},
}));
import { provideRouter } from '@angular/router';

import { FabricService } from '@oscc/features/playground/services/fabric.service';
import { fabric_service_stub } from '@oscc/features/playground/services/fabric-service.stub';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [provideRouter([]), { provide: FabricService, useValue: fabric_service_stub() }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
