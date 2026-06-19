import { Injectable } from '@angular/core';
import { Group, Rect, Textbox } from 'fabric';

import { FabricService } from '@oscc/features/playground/services/fabric.service';
import { LessonCardSpec, LessonCardHandlers } from '@oscc/features/teaching/models/lesson.model';

const WIDTH = 360;
const PADDING = 15;
const SPACING = 8;

/**
 * Draws the teaching lesson as a draggable, non-blocking card on the playground
 * canvas. Owns its own canvas click listener so the generic FabricService stays
 * free of teaching concerns; deleting the teaching feature removes the renderer
 * with it.
 */
@Injectable({ providedIn: 'root' })
export class LessonCardRenderer {
  private card: any = null;
  private handlers: LessonCardHandlers | null = null;
  private listening_canvas: any = null;

  constructor(private fabric: FabricService) {}

  /**
   * Renders the card for the given spec, replacing the previous one in place so
   * its dragged position survives re-renders.
   * @param spec What to draw for the current lesson state.
   * @param handlers Callbacks invoked when a choice or action is clicked.
   */
  public render(spec: LessonCardSpec, handlers: LessonCardHandlers): void {
    this.ensure_listener();
    const canvas = this.fabric.canvas;

    let left: number | undefined;
    let top: number | undefined;
    if (this.card) {
      left = this.card.left;
      top = this.card.top;
      canvas.remove(this.card);
    }

    const children: any[] = [];
    let y = 0;
    // Build a width-aligned textbox, append it, and advance the running y.
    const row = (text: string, opts: any, gap_before = 0): void => {
      y += gap_before;
      const tb = new Textbox(text, { width: WIDTH, left: 0, top: y, fontSize: this.fabric.font_size, ...opts } as any);
      children.push(tb);
      y += (tb.height || 0) + SPACING;
    };

    row(spec.progress, { fontSize: this.fabric.font_size - 3, fill: '#666', selectable: false, evented: false });
    row(spec.prompt, { fontWeight: 'bold', selectable: false, evented: false });
    y += SPACING; // extra breathing room between the prompt and the choices

    spec.choices.forEach((choice, index) => {
      const fill = choice.state === 'correct' ? '#1B5E20' : choice.state === 'wrong' ? '#B71C1C' : '#000000';
      row(`${this.choice_label(index)} ${choice.text}`, {
        fill,
        fontWeight: choice.state === 'correct' ? 'bold' : 'normal',
        lesson_choice: index,
      });
    });

    if (spec.message) {
      const fill = spec.message.kind === 'explanation' ? '#1B5E20' : '#8D6E00';
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
    } as any);

    this.card = group;
    this.handlers = handlers;
    canvas.add(group);
    canvas.requestRenderAll();
  }

  /** Removes the active lesson card, ending the on-canvas lesson. */
  public remove(): void {
    if (this.card) {
      this.fabric.canvas.remove(this.card);
      this.card = null;
      this.handlers = null;
      this.fabric.canvas.requestRenderAll();
    }
  }

  /** Attaches the card click dispatcher to the current canvas, once per canvas. */
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
  }

  private choice_label(index: number): string {
    return `${String.fromCharCode(97 + index)})`;
  }
}
