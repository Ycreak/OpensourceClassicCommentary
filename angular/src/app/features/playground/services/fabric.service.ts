import { Injectable } from '@angular/core';
import { 
  Canvas, 
  Group, 
  Text, 
  Textbox, 
  IText, 
  Rect, Point, util 
} from 'fabric';
import { Observable, Subject } from 'rxjs';

import { UtilityService } from '@oscc/services/utility.service';
import { environment } from '@src/environments/environment';

/** A single rendering of the on-canvas lesson card. The lesson runner owns the
 * state and hands a fresh spec to the fabric service on every interaction. */
export interface LessonCardSpec {
  progress: string;
  prompt: string;
  choices: { text: string; state: 'normal' | 'correct' | 'wrong' }[];
  message: { kind: 'hint' | 'explanation'; text: string } | null;
  action: { kind: 'next' | 'finish' | 'close'; label: string } | null;
}

/** Callbacks the fabric service invokes when the student clicks the lesson card. */
export interface LessonCardHandlers {
  onChoice: (index: number) => void;
  onAction: (kind: 'next' | 'finish' | 'close') => void;
}

/**
 * This service handles everything related to fabric and its canvas.
 * The playground component uses this service to visualize and manipulate documents on a fabricjs canvas.
 */
@Injectable({
  providedIn: 'root',
})
export class FabricService {
  public canvas: Canvas;

  // State Management for Undo/Redo
  private canvas_states: string[] = [];
  private current_state_index: number = -1;
  private undo_status: boolean = false;
  private redo_status: boolean = false;

  public canvas_changed_subject: Subject<object> = new Subject<object>();
  public canvas_changed$: Observable<object> = this.canvas_changed_subject.asObservable();

  readonly font_size: number = 16;
  public documents: any[] = [];

  // Active on-canvas lesson card (teaching package). Null when no lesson is running.
  private lesson_card: any = null;
  private lesson_handlers: LessonCardHandlers | null = null;

  constructor(private utility: UtilityService) {}

  /**
   * Initializes various canvas settings such as drawing brush properties.
   * @returns void
   */
  public init(): void {
    this.resize();
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = 'black';
      this.canvas.freeDrawingBrush.width = 10;
    }
  }

  /**
   * Resizes the canvas based on the dimensions of the browser window.
   * @returns void
   */
  public resize(): void {
    this.canvas.setDimensions({ width: window.innerWidth - 25, height: window.innerHeight });
  }

  /**
   * Sets the event handlers for the canvas, including wheel zooming,
   * shift-key panning, and object selection styling.
   * @returns void
   */
  public set_event_handlers(): void {
    this.canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(0.01, zoom), 20);

      this.canvas.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    this.canvas.on('mouse:down', function (this: any, opt: any) {
      const evt = opt.e;
      if (evt.shiftKey) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:move', function (this: any, opt: any) {
      if (this.isDragging) {
        const e = opt.e;
        const vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });

    this.canvas.on('mouse:up', () => {
      if ((this.canvas as any).isDragging) {
        this.canvas.setViewportTransform((this.canvas as any).viewportTransform);
        (this.canvas as any).isDragging = false;
      }

      this.canvas.selection = true;
      this.canvas_changed_subject.next({});
    });

    // Dispatch clicks on the on-canvas lesson card to the lesson runner.
    this.canvas.on('mouse:down', (opt: any) => {
      if (!this.lesson_card || opt.target !== this.lesson_card || !this.lesson_handlers) {
        return;
      }
      const subs = opt.subTargets || [];
      const choice = subs.find((s: any) => s.lesson_choice !== undefined);
      if (choice) {
        this.lesson_handlers.onChoice(choice.lesson_choice);
        return;
      }
      const action = subs.find((s: any) => s.lesson_action !== undefined);
      if (action) {
        this.lesson_handlers.onAction(action.lesson_action);
      }
    });

    // Save state for undo/redo on major changes
    const stateEvents = ['object:added', 'object:modified', 'object:removed'] as const;
    stateEvents.forEach((event) => {
      this.canvas.on(event, () => {
        if (!this.undo_status && !this.redo_status) {
          this.save_state();
        }
      });
    });
  }

/**
   * Universal internal method to construct and add a document (Fragment or Testimonium) to the canvas.
   * @param doc The document data object.
   * @param top The vertical coordinate for placement.
   * @param left The horizontal coordinate for placement.
   * @param color The background fill color for the document box.
   * @returns void
   */
  private add_document_to_canvas(doc: any, top: number, left: number, color: string): void {
    // Generates the Textbox object (either via create_lines or create_text)
    const content = doc.lines ? this.create_lines(doc, this.font_size) : this.create_text(doc, this.font_size);

    // Specify inner padding around the text block
    const padding = 10;

    // Grab the calculated dimensions of the text content
    const textWidth = content.width || 0;
    const textHeight = content.height || 0;

    // Construct the background box and expand it by the padding value
    const box = new Rect({
      width: textWidth + (padding * 2),
      height: textHeight + (padding * 2),
      fill: color,
      rx: 10,
      ry: 10,
      stroke: 'black',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center'
    });

    // Update the content's anchor point to center so it co-aligns with the background box
    content.set({
      originX: 'center',
      originY: 'center'
    });

    // Combine them directly into a single parent Group. 
    const group = new Group([box, content], {
      top,
      left,
      // Metadata stored on the fabric object for future reference
      identifier: {
        author: doc.author,
        title: doc.title,
        editor: doc.editor,
        name: doc.name,
      },
    } as any);

    this.canvas.add(group);
  }

  /**
   * Creates the header text for a document.
   * @param doc The document object.
   * @param fontSize The size of the font.
   * @returns A Text object.
   */
  public create_header(doc: any, fontSize: number): Text {
    const text = `${this.utility.capitalize_word(doc.document_type)} ${doc.name}`;
    return new Text(text, {
      fontSize,
      fontWeight: 'bold',
      originX: 'left',
    });
  }

  /**
   * Creates a standard Textbox for document types that use a block of text (like Testimonia).
   * @param doc The document object.
   * @param fontSize The size of the font.
   * @returns A Textbox object.
   */
  public create_text(doc: any, fontSize: number): Textbox {
    return new Textbox(doc.text, {
      fontSize,
      originX: 'left',
      width: 300,
    });
  }

  /**
   * Creates structured lines for a document with a dynamic width.
   * The box will shrink to fit short text, but wrap at a set maximum.
   * @param doc The document object containing a 'lines' array.
   * @param fontSize The size of the font.
   * @returns A Textbox object with dynamic width.
   */
  public create_lines(doc: any, fontSize: number): Textbox {
    const rawText = doc.lines.map((l: any) => `${l.text}`).join('\n');
    const positions = this.get_style_positions(rawText, '$');
    const cleanText = rawText.replace(/\$/g, '');

    // Create a dummy IText to measure the "natural" width of the longest line
    const measurer = new IText(cleanText, { fontSize });
    const naturalWidth = measurer.width || 0;

    // Determine the dynamic width (minimum of the text's width or our limit)
    const maxWidth = 450;
    const dynamicWidth = naturalWidth > maxWidth ? maxWidth : naturalWidth + 5;

    const lines = new Textbox(cleanText, {
      fontSize,
      originX: 'left',
      width: dynamicWidth,
      splitByGrapheme: false,
    });

    positions.forEach(([start, end]) => {
      lines.setSelectionStyles({ fontStyle: 'italic' }, start, end);
    });

    return lines;
  }

  /**
   * Scatters all document groups to random positions within the currently visible viewport.
   * @returns void
   */
  public randomize_positions(): void {
    const objects = this.canvas.getObjects().filter((obj) => this.is_document(obj));

    // Get the current visible boundaries of the canvas
    const vpt = this.canvas.viewportTransform;
    const invVpt = util.invertTransform(vpt);

    // Determine the edges of the visible area
    const minX = invVpt[4];
    const minY = invVpt[5];
    const maxX = minX + this.canvas.width / this.canvas.getZoom();
    const maxY = minY + this.canvas.height / this.canvas.getZoom();

    // Padding to ensure documents don't get stuck exactly on the edge
    const padding = 50;

    objects.forEach((obj) => {
      // Generate random coordinates within the visible bounds
      const randomX = Math.random() * (maxX - minX - (obj.width + padding)) + minX;
      const randomY = Math.random() * (maxY - minY - (obj.height + padding)) + minY;

      obj.set({
        left: randomX,
        top: randomY,
      });

      // Ensure coordinates are updated for selection/interaction
      obj.setCoords();
    });

    this.canvas.renderAll();
    this.save_state(); // Save this move to Undo history
  }

  /**
   * Calculates the character positions between delimiters for styling.
   * @param text The raw string containing delimiters.
   * @param delimiter The character used to mark styles (e.g., '$').
   * @returns An array of tuples representing start and end indices.
   */
  private get_style_positions(text: string, delimiter: string): number[][] {
    const parts = text.split(delimiter);
    const tuples: number[][] = [];
    let currentPos = 0;

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        tuples.push([currentPos, currentPos + parts[i].length]);
      }
      currentPos += parts[i].length;
    }
    return tuples;
  }

  /**
   * Creates a background rectangle for a group of text.
   * @param rect The bounding dimensions for the box.
   * @param fill The background color.
   * @returns A Rect object.
   */
  public create_box(rect: any, fill: string): Rect {
    return new Rect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      fill,
      rx: 10,
      ry: 10,
      stroke: 'black',
      strokeWidth: 1,
    });
  }

  /**
   * Checks if the given object is a note
   * @param thing (object)
   * @return boolean
   */
  public is_note(thing: any): boolean {
    return thing.backgroundColor === '#F0C086';
  }

  /**
   * Determines if the given fabric object is a document based on the presence of an identifier.
   * @param thing The fabric object to check.
   * @returns True if it is a document.
   */
  public is_document(thing: any): boolean {
    return !!thing.identifier;
  }

  /**
   * Toggles the canvas drawing mode.
   * @returns void
   */
  public toggle_drawing_mode(): void {
    this.canvas.isDrawingMode = !this.canvas.isDrawingMode;
  }

  /**
   * Serializes the current canvas state and adds it to the history stack.
   * @returns void
   */
  private save_state(): void {
    if (this.current_state_index < this.canvas_states.length - 1) {
      this.canvas_states.splice(this.current_state_index + 1);
    }
    this.canvas_states.push(JSON.stringify(this.canvas));
    this.current_state_index = this.canvas_states.length - 1;
  }

  /**
   * Reverts the canvas to the previous state in history.
   * @returns void
   */
  public undo(): void {
    if (this.current_state_index > 0) {
      this.undo_status = true;
      this.current_state_index--;
      this.canvas.loadFromJSON(this.canvas_states[this.current_state_index]).then(() => {
        this.canvas.renderAll();
        this.undo_status = false;
      });
    }
  }

  /**
   * Advances the canvas to the next state in history.
   * @returns void
   */
  public redo(): void {
    if (this.current_state_index < this.canvas_states.length - 1) {
      this.redo_status = true;
      this.current_state_index++;
      this.canvas.loadFromJSON(this.canvas_states[this.current_state_index]).then(() => {
        this.canvas.renderAll();
        this.redo_status = false;
      });
    }
  }

  /**
   * Adds multiple documents to the playground neatly aligned to the left side.
   * @param documents An array of document objects.
   * @returns void
   */
  public add(documents: any[]): void {
    const offset_top = 200;
    const offset_left = 40; 
    const spacing = 25;

    // Type casting to handle dynamic internal structural access
    const vptCoords = (this.canvas as any).vptCoords;
    let top = vptCoords ? vptCoords.tl.y + offset_top : offset_top;
    const left = vptCoords ? vptCoords.tl.x + offset_left : offset_left;

    documents.forEach((doc) => {
      this.documents.push(doc);
      const color = doc.document_type === environment.fragment ? '#9BA8F2' : 'orange';
      this.add_document_to_canvas(doc, top, left, color);
      top += spacing;
    });
  }

  /**
   * Deletes the currently selected object(s) from the canvas.
   * @returns void
   */
  public delete_selected(): void {
    const active = this.canvas.getActiveObject();
    if (!active) return;

    if (active.type === 'activeSelection') {
      (active as any).forEachObject((obj: any) => this.canvas.remove(obj));
      this.canvas.discardActiveObject();
    } else {
      this.canvas.remove(active);
    }
    this.canvas.requestRenderAll();
  }

  /**
   * Clears all objects and document references from the canvas.
   * @returns void
   */
  public clear(): void {
    this.documents = [];
    this.canvas.clear();
  }

  /**
   * Adds a sticky-note style text box to the center of the current view.
   * @param note The text content for the note.
   * @returns void
   */
  public add_note(note: string): void {
    const center = this.get_center();
    const text = new Textbox(note, {
      top: center.y,
      left: center.x,
      width: 200,
      fontSize: this.font_size,
      backgroundColor: '#F0C086',
      editable: true,
    });
    this.canvas.add(text);
  }

  /**
   * Calculates the visual center of the canvas taking zoom and pan into account.
   * @returns An object with x and y coordinates.
   */
  private get_center(): { x: number; y: number } {
    const vpt = this.canvas.viewportTransform;
    const inv = util.invertTransform(vpt);
    return {
      x: inv[4] + this.canvas.width / this.canvas.getZoom() / 2,
      y: inv[5] + this.canvas.height / this.canvas.getZoom() / 2,
    };
  }

  /**
   * Checks whether the canvas has any items currently selected.
   * @returns boolean
   */
  public has_selection(): boolean {
    return !!this.canvas.getActiveObject();
  }

  /**
   * Renders the on-canvas lesson card from the given spec. The card is a normal
   * (draggable, non-blocking) fabric group so fragments stay interactive around it.
   * Called again on every interaction; the previous card is replaced in place so
   * its position survives re-renders.
   * @param spec What to draw for the current lesson state.
   * @param handlers Callbacks invoked when a choice or action is clicked.
   * @returns void
   */
  public render_lesson_card(spec: LessonCardSpec, handlers: LessonCardHandlers): void {
    let left: number | undefined;
    let top: number | undefined;
    if (this.lesson_card) {
      left = this.lesson_card.left;
      top = this.lesson_card.top;
      this.canvas.remove(this.lesson_card);
    }

    const width = 360;
    const padding = 15;
    const spacing = 8;
    const children: any[] = [];
    let y = 0;

    const progress = new Textbox(spec.progress, {
      fontSize: this.font_size - 3,
      fill: '#666',
      width,
      top: y,
      left: 0,
      selectable: false,
      evented: false,
    } as any);
    children.push(progress);
    y += (progress.height || 0) + spacing;

    const prompt = new Textbox(spec.prompt, {
      fontSize: this.font_size,
      fontWeight: 'bold',
      width,
      top: y,
      left: 0,
      selectable: false,
      evented: false,
    } as any);
    children.push(prompt);
    y += (prompt.height || 0) + spacing * 2;

    spec.choices.forEach((choice, index) => {
      const fill = choice.state === 'correct' ? '#1B5E20' : choice.state === 'wrong' ? '#B71C1C' : '#000000';
      const choice_text = new Textbox(`${this.choice_label(index)} ${choice.text}`, {
        fontSize: this.font_size,
        fill,
        fontWeight: choice.state === 'correct' ? 'bold' : 'normal',
        width,
        top: y,
        left: 0,
        lesson_choice: index,
      } as any);
      children.push(choice_text);
      y += (choice_text.height || 0) + spacing;
    });

    if (spec.message) {
      y += spacing;
      const fill = spec.message.kind === 'explanation' ? '#1B5E20' : '#8D6E00';
      const message = new Textbox(spec.message.text, {
        fontSize: this.font_size,
        fontStyle: 'italic',
        fill,
        width,
        top: y,
        left: 0,
        selectable: false,
        evented: false,
      } as any);
      children.push(message);
      y += (message.height || 0) + spacing;
    }

    if (spec.action) {
      y += spacing;
      const action = new Textbox(spec.action.label, {
        fontSize: this.font_size,
        fontWeight: 'bold',
        fill: '#0D47A1',
        width,
        top: y,
        left: 0,
        lesson_action: spec.action.kind,
      } as any);
      children.push(action);
      y += (action.height || 0) + spacing;
    }

    const box = new Rect({
      top: -padding,
      left: -padding,
      width: width + padding * 2,
      height: y + padding * 2,
      fill: '#FFFDF5',
      rx: 10,
      ry: 10,
      stroke: '#333333',
      strokeWidth: 1,
    });

    const center = this.get_center();
    const group = new Group([box, ...children], {
      // Shift left of centre so the card sits in the visible playground area and
      // does not slip under the commentary panel on the right.
      left: left ?? center.x - width,
      top: top ?? center.y - y / 2,
      subTargetCheck: true,
      hasControls: false,
    } as any);

    this.lesson_card = group;
    this.lesson_handlers = handlers;
    this.canvas.add(group);
    this.canvas.requestRenderAll();
  }

  /**
   * Removes the active lesson card from the canvas, ending the on-canvas lesson.
   * @returns void
   */
  public remove_lesson_card(): void {
    if (this.lesson_card) {
      this.canvas.remove(this.lesson_card);
      this.lesson_card = null;
      this.lesson_handlers = null;
      this.canvas.requestRenderAll();
    }
  }

  /**
   * Returns the label for the choice at the given index, e.g. 'a)'.
   * @param index (number) of the choice
   * @return string
   */
  private choice_label(index: number): string {
    return `${String.fromCharCode(97 + index)})`;
  }
}
