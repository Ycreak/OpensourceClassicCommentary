import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

import { FabricService } from '../services/fabric.service';
import { DropZone, EvaluationResult } from './lesson.model';

/**
 * Lesson-only canvas operations: drop-zones, evaluation, and feedback rendering.
 * Delegates generic canvas state to FabricService so that the canvas wrapper
 * stays free of teaching-specific concerns.
 */
@Injectable({
  providedIn: 'root',
})
export class TeachingFabricService {
  constructor(private fabric_svc: FabricService) {}

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

      (group as any).is_zone = true;
      (group as any).zone_data = { label: zone.label, expected: zone.expected };

      this.fabric_svc.canvas.add(group);
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
   * Scatters every document on the canvas inside the visible viewport while avoiding overlap
   * with the supplied zone rectangles. Falls back to the last sampled position if no overlap-free
   * position is found within the attempt budget.
   * @param zones The zone rectangles to avoid.
   * @returns void
   */
  public scatter_around_zones(zones: DropZone[]): void {
    const view = this.get_viewport_bounds();
    const objects = this.fabric_svc.canvas.getObjects().filter((obj) => this.fabric_svc.is_document(obj));
    const padding = 30;
    const max_attempts = 50;

    objects.forEach((obj) => {
      const bb = obj.getBoundingRect();
      const w = bb.width;
      const h = bb.height;
      const x_range = Math.max(0, view.width - w - padding * 2);
      const y_range = Math.max(0, view.height - h - padding * 2);

      let x = view.min_x + padding;
      let y = view.min_y + padding;
      for (let attempt = 0; attempt < max_attempts; attempt++) {
        x = view.min_x + padding + Math.random() * x_range;
        y = view.min_y + padding + Math.random() * y_range;
        const overlaps = zones.some(
          (z) => !(x + w < z.left || x > z.left + z.width || y + h < z.top || y > z.top + z.height)
        );
        if (!overlaps) break;
      }
      obj.set({ left: x, top: y });
      obj.setCoords();
    });

    this.fabric_svc.canvas.renderAll();
  }

  /**
   * Removes all drop-zone objects from the canvas.
   * @returns void
   */
  public clear_zones(): void {
    const zone_objects = this.fabric_svc.canvas.getObjects().filter((obj) => (obj as any).is_zone === true);
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
      const identifier = (obj as any).identifier;
      const c = obj.getCenterPoint();

      const placed_zone = zones.find((zone) => {
        return c.x >= zone.left && c.x <= zone.left + zone.width && c.y >= zone.top && c.y <= zone.top + zone.height;
      }) || null;

      const should_zone = zones.find((zone) => {
        return zone.expected.some((criterion) => {
          return Object.keys(criterion).every((key) => {
            return (criterion as any)[key] === (identifier as any)[key];
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
      const group = result.fragment_obj as any;
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
    const label = new fabric.Group([verdict, origin], {
      left: rect.left,
      top: rect.top + rect.height + 6,
      selectable: false,
      evented: false,
    });

    (label as any).is_feedback_label = true;
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
    const labels = this.fabric_svc.canvas.getObjects().filter((obj) => (obj as any).is_feedback_label === true);
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
      const group = obj as any;
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
