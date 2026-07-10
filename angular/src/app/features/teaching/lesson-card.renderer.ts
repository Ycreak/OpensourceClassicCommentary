import { Injectable } from '@angular/core';
import { Group, Rect, Textbox } from 'fabric';

import { FabricService } from '@oscc/features/playground/services/fabric.service';
import { LessonCardSpec, LessonCardHandlers } from '@oscc/features/teaching/models/lesson.model';

const WIDTH = 360;
const PADDING = 15;
const SPACING = 8;
const ZONE_WIDTH = 340;
const ZONE_HEIGHT = 260;
const CAT_ZONE_WIDTH = 280;
const CAT_ZONE_HEIGHT = 220;
const STATE_COLORS = { normal: '#666666', correct: '#1B5E20', wrong: '#B71C1C' } as const;

/** Inline style markers usable in lesson text: $italic$, *bold*, _underline_. */
const STYLE_MARKERS: Record<string, object> = {
  $: { fontStyle: 'italic' },
  '*': { fontWeight: 'bold' },
  _: { underline: true },
};

/**
 * Draws the teaching lesson as a draggable, non-blocking card on the playground
 * canvas, plus (per question type) a fragment drop zone or categorize zones
 * with draggable chips. Owns its own canvas listeners so the generic
 * FabricService stays free of teaching concerns; deleting the teaching feature
 * removes the renderer with it.
 */
@Injectable({ providedIn: 'root' })
export class LessonCardRenderer {
  private card: any = null;
  private zone: any = null;
  private cat_zones: any[] = [];
  private chips: any[] = [];
  /** Identifies the current chip set, so chips are re-positioned only on question change. */
  private chips_key = '';
  /** Identifies the full categorize spec, so chips/zones are rebuilt only when they visually change. */
  private chips_full_key = '';
  private handlers: LessonCardHandlers | null = null;
  private listening_canvas: any = null;

  constructor(private fabric: FabricService) {}

  /**
   * Renders the card for the given spec, replacing the previous one in place so
   * its dragged position survives re-renders.
   * @param spec What to draw for the current lesson state.
   * @param handlers Callbacks invoked when the student interacts with the lesson.
   */
  public render(spec: LessonCardSpec, handlers: LessonCardHandlers): void {
    this.ensure_listener();
    const canvas = this.fabric.canvas;

    const left: number | undefined = this.card?.left;
    const top: number | undefined = this.card?.top;
    this.purge('card');

    const children: any[] = [];
    let y = 0;
    // Build a width-aligned textbox with inline styles, append it, and advance the running y.
    const row = (text: string, opts: any, gap_before = 0): void => {
      y += gap_before;
      const { clean, styles } = this.parse_styles(text);
      const tb = new Textbox(clean, { width: WIDTH, left: 0, top: y, fontSize: this.fabric.font_size, ...opts } as any);
      styles.forEach(({ start, end, style }) => tb.setSelectionStyles(style, start, end));
      children.push(tb);
      y += (tb.height || 0) + SPACING;
    };

    row(spec.progress, { fontSize: this.fabric.font_size - 3, fill: '#666', selectable: false, evented: false });
    row(spec.prompt, { fontWeight: 'bold', selectable: false, evented: false });

    (spec.sources || []).forEach((source) => {
      row(source, {
        left: 12,
        width: WIDTH - 12,
        fontSize: this.fabric.font_size - 2,
        fill: '#333',
        selectable: false,
        evented: false,
      });
    });
    y += SPACING; // extra breathing room between the prompt and the choices

    spec.choices.forEach((choice, index) => {
      const fill = choice.state === 'correct' ? STATE_COLORS.correct : choice.state === 'wrong' ? STATE_COLORS.wrong : '#000000';
      const checkbox = spec.multi ? (choice.selected ? '☑ ' : '☐ ') : '';
      row(`${checkbox}${this.choice_label(index)} ${choice.text}`, {
        fill,
        fontWeight: choice.state === 'correct' ? 'bold' : 'normal',
        lesson_choice: index,
      });
    });

    if (spec.message) {
      const fill = spec.message.kind === 'explanation' ? STATE_COLORS.correct : '#8D6E00';
      row(spec.message.text, { fontStyle: 'italic', fill, selectable: false, evented: false }, SPACING);
    }

    if (spec.action) {
      row(spec.action.label, { fontWeight: 'bold', fill: '#0D47A1', lesson_action: spec.action.kind }, SPACING);
    }

    const box = new Rect({
      top: -PADDING,
      left: -PADDING,
      width: WIDTH + PADDING * 2,
      height: y + PADDING * 2,
      fill: '#FFFDF5',
      rx: 10,
      ry: 10,
      stroke: '#333333',
      strokeWidth: 1,
    });

    const center = this.fabric.get_center();
    const group = new Group([box, ...children], {
      // Shift left of centre so the card sits in the visible playground area and
      // does not slip under the commentary panel on the right.
      left: left ?? center.x - WIDTH,
      top: top ?? center.y - y / 2,
      subTargetCheck: true,
      hasControls: false,
      lesson_tag: 'card',
    } as any);

    this.card = group;
    this.handlers = handlers;
    canvas.add(group);
    this.render_zone(spec);
    this.render_categorize(spec);
    canvas.requestRenderAll();
  }

  /** Removes the active lesson card, ending the on-canvas lesson. */
  public remove(): void {
    this.purge('card');
    this.card = null;
    this.handlers = null;
    this.remove_zone();
    this.remove_categorize();
    this.fabric.canvas.requestRenderAll();
  }

  /**
   * Extracts inline style markers ($italic$, *bold*, _underline_) from raw
   * lesson text, returning the clean text plus the style ranges to apply.
   */
  private parse_styles(raw: string): { clean: string; styles: { start: number; end: number; style: object }[] } {
    const styles: { start: number; end: number; style: object }[] = [];
    const open: Record<string, number> = {};
    let clean = '';
    for (const char of raw) {
      if (!(char in STYLE_MARKERS)) {
        clean += char;
      } else if (open[char] === undefined) {
        open[char] = clean.length;
      } else {
        styles.push({ start: open[char], end: clean.length, style: STYLE_MARKERS[char] });
        delete open[char];
      }
    }
    return { clean, styles };
  }

  /**
   * Removes every canvas object carrying the given lesson tag. Removal goes by
   * a canvas scan rather than stored references: if the canvas was reloaded
   * (undo/redo restores serialized clones), stored references are dead and
   * reference-based removal would leave duplicates behind.
   */
  private purge(tag: string): void {
    const canvas = this.fabric.canvas;
    canvas
      .getObjects()
      .filter((obj: any) => obj.lesson_tag === tag)
      .forEach((obj: any) => canvas.remove(obj));
  }

  /** Builds a dashed zone box with a label; not evented, so it never steals
   * clicks or selections from the objects dragged onto it. */
  private build_zone(label: string, color: string, width: number, height: number, left: number, top: number, tag: string): Group {
    const box = new Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: 'rgba(0, 0, 0, 0.03)',
      rx: 10,
      ry: 10,
      stroke: color,
      strokeWidth: 2,
      strokeDashArray: [8, 6],
    });
    const text = new Textbox(label, {
      left: 0,
      top: height - this.fabric.font_size - PADDING,
      width,
      fontSize: this.fabric.font_size,
      fill: color,
      textAlign: 'center',
    } as any);
    return new Group([box, text], { left, top, selectable: false, evented: false, lesson_tag: tag } as any);
  }

  /**
   * Keeps the fragment drop zone in sync with the spec: draws it next to the
   * card for drag-drop questions (replacing in place so its position survives
   * re-renders) and removes it for other question types.
   */
  private render_zone(spec: LessonCardSpec): void {
    const canvas = this.fabric.canvas;
    const left = this.zone?.left;
    const top = this.zone?.top;
    this.remove_zone();
    if (!spec.drop_zone) {
      return;
    }
    this.zone = this.build_zone(
      spec.drop_zone.label,
      STATE_COLORS[spec.drop_zone.state],
      ZONE_WIDTH,
      ZONE_HEIGHT,
      left ?? (this.card.left || 0) + WIDTH + PADDING * 2 + 40,
      top ?? this.card.top,
      'drop_zone'
    );
    canvas.add(this.zone);
  }

  private remove_zone(): void {
    this.purge('drop_zone');
    this.zone = null;
  }

  /**
   * Keeps the categorize zones and chips in sync with the spec. Zones and chips
   * are replaced in place so dragged positions survive re-renders; chips are
   * laid out fresh only when the question (chip set) changes.
   */
  private render_categorize(spec: LessonCardSpec): void {
    const canvas = this.fabric.canvas;
    const full_key = spec.categorize ? JSON.stringify(spec.categorize) : '';
    if (full_key === this.chips_full_key) {
      // Nothing visual changed (e.g. a chip was merely dragged): leave the live
      // chips and zones alone. Rebuilding the chip under the student's cursor
      // leaves fabric's drag transform pointing at a removed object.
      return;
    }
    const zone_positions = this.cat_zones.map((zone) => ({ left: zone.left, top: zone.top }));
    const chip_positions = this.chips.map((chip) => ({ left: chip.left, top: chip.top }));
    const key = spec.categorize ? JSON.stringify(spec.categorize.items.map((item) => item.text)) : '';
    const same_question = key === this.chips_key;
    this.remove_categorize();
    this.chips_key = key;
    this.chips_full_key = full_key;
    if (!spec.categorize) {
      return;
    }

    spec.categorize.zones.forEach((zone, i) => {
      const group = this.build_zone(
        zone.label,
        STATE_COLORS.normal,
        CAT_ZONE_WIDTH,
        CAT_ZONE_HEIGHT,
        same_question && zone_positions[i]
          ? zone_positions[i].left
          : (this.card.left || 0) + WIDTH + PADDING * 2 + 40 + i * (CAT_ZONE_WIDTH + 30),
        same_question && zone_positions[i] ? zone_positions[i].top : this.card.top,
        'cat_zone'
      );
      this.cat_zones.push(group);
      canvas.add(group);
    });

    spec.categorize.items.forEach((item, i) => {
      const color = item.state === 'normal' ? '#333333' : STATE_COLORS[item.state];
      const text = new Textbox(item.text, {
        fontSize: this.fabric.font_size,
        width: 200,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      } as any);
      const box = new Rect({
        width: (text.width || 0) + 20,
        height: (text.height || 0) + 12,
        fill: '#FFFFFF',
        rx: 6,
        ry: 6,
        stroke: color,
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
      });
      const chip = new Group([box, text], {
        left: same_question && chip_positions[i] ? chip_positions[i].left : this.card.left,
        top: same_question && chip_positions[i] ? chip_positions[i].top : this.card.top + (this.card.height || 0) + 25 + i * 45,
        hasControls: false,
        lesson_item: i,
        lesson_tag: 'chip',
      } as any);
      this.chips.push(chip);
      canvas.add(chip);
    });
  }

  private remove_categorize(): void {
    this.purge('cat_zone');
    this.purge('chip');
    this.cat_zones = [];
    this.chips = [];
    this.chips_full_key = '';
  }

  /** True when the point lies inside the object's bounding box (scene coordinates). */
  private contains(obj: any, point: { x: number; y: number }): boolean {
    const bounds = obj.getBoundingRect();
    return (
      point.x >= bounds.left &&
      point.x <= bounds.left + bounds.width &&
      point.y >= bounds.top &&
      point.y <= bounds.top + bounds.height
    );
  }

  /** Attaches the card click and drop dispatchers to the current canvas, once per canvas. */
  private ensure_listener(): void {
    const canvas = this.fabric.canvas;
    if (!canvas || canvas === this.listening_canvas) {
      return;
    }
    this.listening_canvas = canvas;
    canvas.on('mouse:down', (opt: any) => {
      if (!this.card || opt.target !== this.card || !this.handlers) {
        return;
      }
      const subs = opt.subTargets || [];
      const choice = subs.find((s: any) => s.lesson_choice !== undefined);
      if (choice) {
        this.handlers.onChoice(choice.lesson_choice);
        return;
      }
      const action = subs.find((s: any) => s.lesson_action !== undefined);
      if (action) {
        this.handlers.onAction(action.lesson_action);
      }
    });
    // Drop detection: after a drag ends, an object whose centre lies inside a
    // zone counts as dropped into it.
    canvas.on('object:modified', (opt: any) => {
      const target = opt.target;
      if (!target || !this.handlers) {
        return;
      }
      const center = target.getCenterPoint();
      if (target.lesson_item !== undefined) {
        const zone = this.cat_zones.findIndex((z) => this.contains(z, center));
        this.handlers.onPlace(target.lesson_item, zone === -1 ? null : zone);
        return;
      }
      if (this.zone && target.identifier && this.contains(this.zone, center)) {
        this.handlers.onDrop(target.identifier);
      }
    });
  }

  private choice_label(index: number): string {
    return `${String.fromCharCode(97 + index)})`;
  }
}
