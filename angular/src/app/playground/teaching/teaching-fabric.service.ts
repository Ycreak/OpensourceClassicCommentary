import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

import { FabricService } from '../services/fabric.service';
import { DocumentIdentifier, DocumentObject } from '../services/document-object';
import { DropZone, EvaluationResult, FragmentReference } from './lesson.model';

/**
 * The criteria a Zone expects an incoming Fragment to satisfy. Mirrors the
 * shape stored on DropZone.expected, just lifted to a local alias so the
 * helpers below can name it once.
 */
type ExpectedCriteria = Partial<FragmentReference>[];

/**
 * A fabric Group that has been tagged as a lesson drop-zone, carrying the
 * Zone's label and the criteria it expects. The underlying property names
 * (`is_zone`, `zone_data`) are stamped on the fabric object so other canvas
 * code (and serialization) sees them as plain runtime fields; the branded
 * type just lets TypeScript see them too.
 */
interface ZoneObject extends fabric.Group {
  is_zone: true;
  zone_data: { label: string; expected: ExpectedCriteria };
}

/**
 * A fabric Group that renders the green/red "Juist:" / "Fout:" verdict shown
 * under a fragment after the user clicks Controleer. Tagged so clear_feedback
 * can wipe just these between steps without touching the documents.
 */
interface FeedbackLabelObject extends fabric.Group {
  is_feedback_label: true;
}

/**
 * A DocumentObject from the canvas seam plus access to the internal fabric
 * children that apply_feedback / clear_feedback need to recolour. Those
 * internals are not part of the public DocumentObject contract — keeping the
 * extension local makes that boundary visible.
 */
type FeedbackTargetGroup = DocumentObject & {
  _objects: (fabric.Object & { default_fill?: string; dirty?: boolean })[];
  dirty?: boolean;
};

/**
 * Lesson-only canvas operations: drop-zones, evaluation, and feedback rendering.
 * Delegates generic canvas state to FabricService so that the canvas wrapper
 * stays free of teaching-specific concerns.
 */
@Injectable({
  providedIn: 'root',
})
export class TeachingFabricService {
  /** Tag attached to a fabric object to mark it as a lesson drop-zone. */
  private static readonly ZONE_TAG = 'is_zone';

  constructor(private fabric_svc: FabricService) {}

  /**
   * Brands a fabric Group as a Zone by stamping the tag and zone_data on it.
   * Keeps the mutation in one spot so the magic-string property names live
   * exactly once in the module.
   */
  private tag_as_zone(group: fabric.Group, zone_data: ZoneObject['zone_data']): ZoneObject {
    const zone = group as ZoneObject;
    zone[TeachingFabricService.ZONE_TAG as 'is_zone'] = true;
    zone.zone_data = zone_data;
    return zone;
  }

  /**
   * Brands a fabric Group as a FeedbackLabel so clear_feedback_labels can
   * find and remove just these between steps.
   */
  private tag_as_feedback_label(group: fabric.Group): FeedbackLabelObject {
    const label = group as FeedbackLabelObject;
    label.is_feedback_label = true;
    return label;
  }

  /**
   * Typeguard: true when the fabric object has been branded by tag_as_zone.
   * Keeps zone identity an internal concern of the teaching layer.
   */
  private is_zone(obj: fabric.Object): obj is ZoneObject {
    return (obj as Partial<ZoneObject>)?.[TeachingFabricService.ZONE_TAG as 'is_zone'] === true;
  }

  /**
   * Typeguard: true when the fabric object has been branded by
   * tag_as_feedback_label.
   */
  private is_feedback_label(obj: fabric.Object): obj is FeedbackLabelObject {
    return (obj as Partial<FeedbackLabelObject>)?.is_feedback_label === true;
  }

  /**
   * Adds lesson drop-zones to the canvas as non-selectable, non-evented groups.
   * Each zone consists of a dashed rectangle and a label. Zones are positioned
   * centered in the current visible viewport (vertically stacked when multiple),
   * and the input zone objects are mutated with the computed left/top so that
   * evaluate_step reads the same coordinates.
   * @param zones The drop-zone definitions to render (mutated in place with computed positions).
   * @returns void
   */
  public add_zones(zones: DropZone[]): void {
    if (zones.length === 0) return;

    const view = this.get_viewport_bounds();
    const gap = 20;
    const total_h = zones.reduce((s, z) => s + z.height, 0) + gap * Math.max(0, zones.length - 1);
    let cursor_y = view.cy - total_h / 2;

    zones.forEach((zone) => {
      const left = view.cx - zone.width / 2;
      const top = cursor_y;
      cursor_y += zone.height + gap;

      zone.left = left;
      zone.top = top;

      const rect = new fabric.Rect({
        left,
        top,
        width: zone.width,
        height: zone.height,
        fill: 'rgba(227,242,253,0.35)',
        stroke: '#1976D2',
        strokeDashArray: [10, 5],
        strokeWidth: 2,
        rx: 8,
        ry: 8,
        selectable: false,
        evented: false,
      });

      const label = new fabric.Text(zone.label, {
        left: left + 8,
        top: top + 8,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#1976D2',
        selectable: false,
        evented: false,
      });

      const group = new fabric.Group([rect, label], {
        selectable: false,
        evented: false,
      });

      const zone_obj = this.tag_as_zone(group, { label: zone.label, expected: zone.expected });

      this.fabric_svc.canvas.add(zone_obj);
    });
  }

  /**
   * Returns the current viewport bounds (min coords, dimensions, center) in canvas space.
   */
  private get_viewport_bounds(): { min_x: number; min_y: number; width: number; height: number; cx: number; cy: number } {
    const vpt = this.fabric_svc.canvas.viewportTransform!;
    const inv_vpt = fabric.util.invertTransform(vpt);
    const min_x = inv_vpt[4];
    const min_y = inv_vpt[5];
    const width = this.fabric_svc.canvas.width! / this.fabric_svc.canvas.getZoom();
    const height = this.fabric_svc.canvas.height! / this.fabric_svc.canvas.getZoom();
    return { min_x, min_y, width, height, cx: min_x + width / 2, cy: min_y + height / 2 };
  }

  /**
   * Scatters every document on the canvas inside the visible viewport. For each
   * document, samples up to `max_attempts` candidate positions, rejects any that
   * overlap a drop-zone, and otherwise scores by how much area they overlap with
   * documents already placed in this pass. The lowest-overlap candidate wins;
   * a zone-free, doc-free candidate is taken immediately. When no zone-free
   * position is found within the budget, the document is snapped to a safe slot
   * outside the zones (corner of the viewport or below the bottommost zone)
   * instead of being abandoned inside one.
   * @param zones The zone rectangles to avoid.
   * @returns void
   */
  public scatter_around_zones(zones: DropZone[]): void {
    const view = this.get_viewport_bounds();
    const objects = this.fabric_svc.canvas.getObjects().filter((obj) => this.fabric_svc.is_document(obj));
    const padding = 30;
    const max_attempts = 80;

    // Axis-aligned rectangle intersection area; 0 means no overlap.
    const overlap_area = (
      a: { left: number; top: number; width: number; height: number },
      b: { left: number; top: number; width: number; height: number }
    ): number => {
      const dx = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
      const dy = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
      return dx > 0 && dy > 0 ? dx * dy : 0;
    };

    const placed: { left: number; top: number; width: number; height: number }[] = [];

    objects.forEach((obj) => {
      const bb = obj.getBoundingRect();
      const w = bb.width;
      const h = bb.height;
      const x_range = Math.max(0, view.width - w - padding * 2);
      const y_range = Math.max(0, view.height - h - padding * 2);

      let best_x = view.min_x + padding;
      let best_y = view.min_y + padding;
      let best_doc_overlap = Number.POSITIVE_INFINITY;
      let zone_free_found = false;

      for (let attempt = 0; attempt < max_attempts; attempt++) {
        const x = view.min_x + padding + Math.random() * x_range;
        const y = view.min_y + padding + Math.random() * y_range;
        const candidate = { left: x, top: y, width: w, height: h };

        // Reject candidates that overlap any zone at all.
        const zone_hit = zones.some(
          (z) => overlap_area(candidate, { left: z.left, top: z.top, width: z.width, height: z.height }) > 0
        );
        if (zone_hit) continue;

        // Score against already-placed documents; smaller overlap is better.
        const doc_overlap = placed.reduce((sum, p) => sum + overlap_area(candidate, p), 0);
        if (doc_overlap < best_doc_overlap) {
          best_doc_overlap = doc_overlap;
          best_x = x;
          best_y = y;
          zone_free_found = true;
          if (doc_overlap === 0) break; // Perfect fit, stop sampling.
        }
      }

      // Fallback: random sampling never found a zone-free spot. Snap to a safe
      // location outside every zone instead of leaving the doc inside one.
      if (!zone_free_found) {
        const fallback = this.find_safe_fallback(view, zones, w, h, padding);
        best_x = fallback.x;
        best_y = fallback.y;
      }

      obj.set({ left: best_x, top: best_y });
      obj.setCoords();
      placed.push({ left: best_x, top: best_y, width: w, height: h });
    });

    this.fabric_svc.canvas.renderAll();
  }

  /**
   * Picks a position for a document that is guaranteed not to overlap any zone,
   * used when random sampling exhausts its budget. Tries the four viewport
   * corners and the strip directly below the bottommost zone; falls back to the
   * top-left padding corner if every option still hits a zone (which can only
   * happen on absurdly small viewports).
   */
  private find_safe_fallback(
    view: { min_x: number; min_y: number; width: number; height: number },
    zones: DropZone[],
    w: number,
    h: number,
    padding: number
  ): { x: number; y: number } {
    const candidates: { x: number; y: number }[] = [
      { x: view.min_x + padding, y: view.min_y + padding },
      { x: view.min_x + view.width - w - padding, y: view.min_y + padding },
      { x: view.min_x + padding, y: view.min_y + view.height - h - padding },
      { x: view.min_x + view.width - w - padding, y: view.min_y + view.height - h - padding },
    ];

    if (zones.length > 0) {
      const bottom_most = Math.max(...zones.map((z) => z.top + z.height));
      candidates.push({ x: view.min_x + padding, y: bottom_most + padding });
    }

    const hits_zone = (x: number, y: number): boolean =>
      zones.some((z) => !(x + w <= z.left || x >= z.left + z.width || y + h <= z.top || y >= z.top + z.height));

    for (const c of candidates) {
      if (!hits_zone(c.x, c.y)) return c;
    }
    return { x: view.min_x + padding, y: view.min_y + padding };
  }

  /**
   * Removes all drop-zone objects from the canvas.
   * @returns void
   */
  public clear_zones(): void {
    const zone_objects = this.fabric_svc.canvas.getObjects().filter((obj) => this.is_zone(obj));
    zone_objects.forEach((obj) => this.fabric_svc.canvas.remove(obj));
    this.fabric_svc.canvas.requestRenderAll();
  }

  /**
   * Evaluates the placement of every document on the canvas against the given drop-zones.
   * For each document, determines the zone whose rectangle contains its centroid (if any)
   * and the zone whose expected criteria match the document's identifier (if any).
   * @param zones The drop-zones defined for the current lesson step.
   * @returns An array of evaluation results, one per document on the canvas.
   */
  public evaluate_step(zones: DropZone[]): EvaluationResult[] {
    const documents = this.fabric_svc.canvas.getObjects().filter((obj) => this.fabric_svc.is_document(obj));

    return documents.map((obj) => {
      const identifier: DocumentIdentifier = obj.identifier;
      const c = obj.getCenterPoint();

      const placed_zone = zones.find((zone) => {
        return c.x >= zone.left && c.x <= zone.left + zone.width && c.y >= zone.top && c.y <= zone.top + zone.height;
      }) || null;

      const should_zone = zones.find((zone) => {
        return zone.expected.some((criterion) => {
          return (Object.keys(criterion) as (keyof DocumentIdentifier)[]).every((key) => {
            return criterion[key] === identifier[key];
          });
        });
      }) || null;

      const is_correct = placed_zone === should_zone;

      return {
        fragment_obj: obj,
        fragment_identifier: identifier,
        placed_zone_label: placed_zone ? placed_zone.label : null,
        should_zone_label: should_zone ? should_zone.label : null,
        is_correct,
      };
    });
  }

  /**
   * Applies visual feedback to each evaluated fragment by recoloring its inner box stroke.
   * Correct placements receive a green stroke, incorrect placements receive a red stroke.
   * Discards any active selection first so the rendered border is the feedback stroke,
   * not Fabric's selection chrome. Marks the rect and its parent group dirty so the
   * change escapes the Group's object cache in Fabric v6.
   * @param results The evaluation results produced by evaluate_step.
   * @returns void
   */
  public apply_feedback(results: EvaluationResult[]): void {
    this.fabric_svc.canvas.discardActiveObject();
    this.clear_feedback_labels();
    results.forEach((result) => {
      const group = result.fragment_obj as FeedbackTargetGroup;
      const inner_rect = group._objects[0];
      inner_rect.set({
        fill: result.is_correct ? '#C8E6C9' : '#FFCDD2',
        stroke: result.is_correct ? '#2E7D32' : '#C62828',
        strokeWidth: 3,
      });
      inner_rect.dirty = true;
      group.dirty = true;
      this.add_feedback_label(result);
    });
    this.fabric_svc.canvas.requestRenderAll();
  }

  /**
   * Adds a red/green origin label underneath a checked lesson answer.
   */
  private add_feedback_label(result: EvaluationResult): void {
    const rect = result.fragment_obj.getBoundingRect();
    const colour = result.is_correct ? '#2E7D32' : '#C62828';
    const verdict = new fabric.Text(result.is_correct ? 'Juist:' : 'Fout:', {
      left: 0,
      top: 0,
      fontSize: 15,
      fontWeight: 'bold',
      fill: colour,
    });
    const origin = new fabric.Textbox(this.get_feedback_origin_text(result), {
      left: (verdict.width ?? 0) + 6,
      top: 0,
      width: Math.max(rect.width - (verdict.width ?? 0) - 6, 220),
      fontSize: 15,
      fill: '#212121',
    });
    const label = this.tag_as_feedback_label(
      new fabric.Group([verdict, origin], {
        left: rect.left,
        top: rect.top + rect.height + 6,
        selectable: false,
        evented: false,
      })
    );

    this.fabric_svc.canvas.add(label);
    this.fabric_svc.canvas.bringObjectToFront(label);
  }

  /**
   * Builds the visible answer-origin text shown after checking a lesson step.
   */
  private get_feedback_origin_text(result: EvaluationResult): string {
    const fragment = result.fragment_identifier;
    return `${fragment.author}, ${fragment.title}, ${fragment.editor}, fr. ${fragment.name}`;
  }

  /**
   * Removes previous answer-origin labels from the canvas.
   */
  private clear_feedback_labels(): void {
    const labels = this.fabric_svc.canvas.getObjects().filter((obj) => this.is_feedback_label(obj));
    labels.forEach((label) => this.fabric_svc.canvas.remove(label));
  }

  /**
   * Resets the feedback stroke styling on every document back to its default appearance.
   * @returns void
   */
  public clear_feedback(): void {
    this.clear_feedback_labels();
    const documents = this.fabric_svc.canvas.getObjects().filter((obj) => this.fabric_svc.is_document(obj));
    documents.forEach((obj) => {
      const group = obj as FeedbackTargetGroup;
      const inner_rect = group._objects[0];
      inner_rect.set({
        fill: inner_rect.default_fill ?? '#9BA8F2',
        stroke: 'black',
        strokeWidth: 1,
      });
      inner_rect.dirty = true;
      group.dirty = true;
    });
    this.fabric_svc.canvas.requestRenderAll();
  }

  /**
   * Restores the canvas to a previously captured initial state.
   * @param initial_state The serialized canvas state to restore.
   * @returns void
   */
  public reset_fragments_to_initial(initial_state: any): void {
    this.fabric_svc.canvas.loadFromJSON(initial_state, () => this.fabric_svc.canvas.renderAll());
  }
}
