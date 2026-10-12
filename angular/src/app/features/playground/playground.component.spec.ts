import { ComponentFixture, TestBed } from '@angular/core/testing';

// FabricJS needs a real 2d canvas context, which jsdom does not provide. The
// component builds a canvas directly (see init_playground), so the module itself is
// replaced rather than just the service. These tests only check that the component
// can be created.
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

import { FabricService } from './services/fabric.service';
import { fabric_service_stub } from './services/fabric-service.stub';

import { PlaygroundComponent } from './playground.component';

describe('PlaygroundComponent', () => {
  let component: PlaygroundComponent;
  let fixture: ComponentFixture<PlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundComponent],
      providers: [{ provide: FabricService, useValue: fabric_service_stub() }],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
