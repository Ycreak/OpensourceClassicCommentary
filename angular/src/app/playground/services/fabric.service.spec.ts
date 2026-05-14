import { TestBed } from '@angular/core/testing';

import { FabricService } from './fabric.service';
import { DropZone } from '../teaching/lesson.model';

describe('FabricService', () => {
  let service: FabricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FabricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('evaluate_step', () => {
    /**
     * Build a minimal fragment stand-in: object with an `identifier` (so
     * `is_document` returns true) and a `getCenterPoint()` returning a fixed
     * coordinate. `evaluate_step` only reads these two surfaces.
     */
    const make_fragment = (
      identifier: { author: string; title: string; editor: string; name: string },
      x: number,
      y: number
    ): any => ({
      identifier,
      getCenterPoint: () => ({ x, y }),
    });

    /**
     * Stub the service's canvas with the bare minimum API surface used by
     * `evaluate_step`: a `getObjects()` returning the supplied fragments.
     */
    const stub_canvas = (objects: any[]): void => {
      (service as any).canvas = {
        getObjects: () => objects,
      };
    };

    it('flags a Pacuvius fragment dropped in an Ennius zone as is_correct=false', () => {
      const zones: DropZone[] = [
        {
          label: 'Ennius',
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          expected: [{ author: 'Ennius' }],
        },
      ];
      const pacuvius = make_fragment(
        { author: 'Pacuvius', title: 'Chryses', editor: 'Schierl', name: '74' },
        50,
        50
      );
      stub_canvas([pacuvius]);

      const results = service.evaluate_step(zones);

      expect(results.length).toBe(1);
      expect(results[0].placed_zone_label).toBe('Ennius');
      expect(results[0].should_zone_label).toBeNull();
      expect(results[0].is_correct).toBeFalse();
    });

    it('flags an Ennius/Thyestes fragment placed in the Ennius zone as is_correct=true', () => {
      const zones: DropZone[] = [
        {
          label: 'Ennius',
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          expected: [{ author: 'Ennius' }],
        },
      ];
      const ennius_thyestes = make_fragment(
        { author: 'Ennius', title: 'Thyestes', editor: 'Jocelyn', name: '150' },
        50,
        50
      );
      stub_canvas([ennius_thyestes]);

      const results = service.evaluate_step(zones);

      expect(results.length).toBe(1);
      expect(results[0].placed_zone_label).toBe('Ennius');
      expect(results[0].should_zone_label).toBe('Ennius');
      expect(results[0].is_correct).toBeTrue();
    });

    it('matches OR-criterion: Thyestes OR Atreus', () => {
      const zones: DropZone[] = [
        {
          label: 'Tragic Brothers',
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          expected: [{ title: 'Thyestes' }, { title: 'Atreus' }],
        },
      ];
      // All fragments outside the zone (centroid at 500, 500).
      const ennius_thyestes = make_fragment(
        { author: 'Ennius', title: 'Thyestes', editor: 'Jocelyn', name: '150' },
        500,
        500
      );
      const accius_atreus = make_fragment(
        { author: 'Accius', title: 'Atreus', editor: 'Dangel', name: '1' },
        500,
        500
      );
      const pacuvius_chryses = make_fragment(
        { author: 'Pacuvius', title: 'Chryses', editor: 'Schierl', name: '74' },
        500,
        500
      );
      stub_canvas([ennius_thyestes, accius_atreus, pacuvius_chryses]);

      const results = service.evaluate_step(zones);

      expect(results.length).toBe(3);

      // Thyestes: should be in zone, but is outside -> incorrect.
      expect(results[0].placed_zone_label).toBeNull();
      expect(results[0].should_zone_label).toBe('Tragic Brothers');
      expect(results[0].is_correct).toBeFalse();

      // Atreus: should be in zone, but is outside -> incorrect.
      expect(results[1].placed_zone_label).toBeNull();
      expect(results[1].should_zone_label).toBe('Tragic Brothers');
      expect(results[1].is_correct).toBeFalse();

      // Pacuvius/Chryses: doesn't match either criterion, outside zone -> correct.
      expect(results[2].placed_zone_label).toBeNull();
      expect(results[2].should_zone_label).toBeNull();
      expect(results[2].is_correct).toBeTrue();
    });

    it('compound criterion needs all keys to match', () => {
      const zones: DropZone[] = [
        {
          label: 'Ennius Thyestes',
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          expected: [{ author: 'Ennius', title: 'Thyestes' }],
        },
      ];
      const ennius_thyestes = make_fragment(
        { author: 'Ennius', title: 'Thyestes', editor: 'Jocelyn', name: '150' },
        500,
        500
      );
      const ennius_eumenides = make_fragment(
        { author: 'Ennius', title: 'Eumenides', editor: 'Jocelyn', name: '40' },
        500,
        500
      );
      const accius_atreus = make_fragment(
        { author: 'Accius', title: 'Atreus', editor: 'Dangel', name: '1' },
        500,
        500
      );
      stub_canvas([ennius_thyestes, ennius_eumenides, accius_atreus]);

      const results = service.evaluate_step(zones);

      expect(results.length).toBe(3);

      // Ennius/Thyestes matches both keys -> should land here.
      expect(results[0].should_zone_label).toBe('Ennius Thyestes');
      // Ennius/Eumenides: author matches but title does not -> no zone.
      expect(results[1].should_zone_label).toBeNull();
      // Accius/Atreus: neither key matches -> no zone.
      expect(results[2].should_zone_label).toBeNull();
    });

    it('fragment outside zone bounds gets placed_zone_label=null', () => {
      const zones: DropZone[] = [
        {
          label: 'Ennius',
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          expected: [{ author: 'Ennius' }],
        },
      ];
      // Centroid well outside the zone rectangle.
      const ennius = make_fragment(
        { author: 'Ennius', title: 'Thyestes', editor: 'Jocelyn', name: '150' },
        500,
        500
      );
      stub_canvas([ennius]);

      const results = service.evaluate_step(zones);

      expect(results.length).toBe(1);
      expect(results[0].placed_zone_label).toBeNull();
      // It should belong to Ennius, but isn't placed there -> incorrect.
      expect(results[0].should_zone_label).toBe('Ennius');
      expect(results[0].is_correct).toBeFalse();
    });
  });
});
