import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { Observable, Subject } from 'rxjs';

import { UtilityService } from '@oscc/utility.service';
import { environment } from '@src/environments/environment';

/**
 * This service handles everything related to fabric and its canvas.
 * The playground component uses this service to visualize and manipulate documents on a fabricjs canvas.
 */
@Injectable({
  providedIn: 'root',
})
export class FabricService {
  public canvas: fabric.Canvas;

  // State Management for Undo/Redo
  private canvas_states: string[] = [];
  private current_state_index: number = -1;
  private undo_status: boolean = false;
  private redo_status: boolean = false;

  public canvas_changed_subject: Subject<object> = new Subject<object>();
  public canvas_changed$: Observable<object> = this.canvas_changed_subject.asObservable();

  readonly font_size: number = 16;
  public documents: any[] = [];

  constructor(private utility: UtilityService) {}

  /**
   * Initializes various canvas settings such as drawing brush properties.
   * @returns void
   */
  public init(): void {
    this.resize();
    this.canvas.freeDrawingBrush.color = 'black';
    this.canvas.freeDrawingBrush.width = 10;
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

      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
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
      if (this.canvas.isDragging) {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.canvas.isDragging = false;
      }

      this.canvas.selection = true;
      this.canvas_changed_subject.next({});
    });

    // Save state for undo/redo on major changes
    const stateEvents = ['object:added', 'object:modified', 'object:removed'];
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
    //const header = this.create_header(doc, this.font_size);
    const content = doc.lines ? this.create_lines(doc, this.font_size) : this.create_text(doc, this.font_size);

    //content.set({ top: header.height + 5 });

    const text_group = new fabric.Group([content], { padding: 10 });
    const box = this.create_box(text_group.getBoundingRect(), color);

    const group = new fabric.Group([box, text_group], {
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
   * @returns A fabric.Text object.
   */
  public create_header(doc: any, fontSize: number): fabric.Text {
    const text = `${this.utility.capitalize_word(doc.document_type)} ${doc.name}`;
    return new fabric.Text(text, {
      fontSize,
      fontWeight: 'bold',
      originX: 'left',
    });
  }

  /**
   * Creates a standard Textbox for document types that use a block of text (like Testimonia).
   * @param doc The document object.
   * @param fontSize The size of the font.
   * @returns A fabric.Textbox object.
   */
  public create_text(doc: any, fontSize: number): fabric.Textbox {
    return new fabric.Textbox(doc.text, {
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
   * @returns A fabric.Textbox object with dynamic width.
   */
  public create_lines(doc: any, fontSize: number): fabric.Textbox {
    const rawText = doc.lines.map((l: any) => `${l.text}`).join('\n');
    const positions = this.get_style_positions(rawText, '$');
    const cleanText = rawText.replace(/\$/g, '');

    // Create a dummy IText to measure the "natural" width of the longest line
    const measurer = new fabric.IText(cleanText, { fontSize });
    const naturalWidth = measurer.width || 0;

    // Determine the dynamic width (minimum of the text's width or our limit)
    // We add a small buffer (e.g., 5-10px) to prevent accidental wrapping due to rounding
    const maxWidth = 450;
    const dynamicWidth = naturalWidth > maxWidth ? maxWidth : naturalWidth + 5;

    const lines = new fabric.Textbox(cleanText, {
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
    const invVpt = fabric.util.invertTransform(vpt!);

    // Determine the edges of the visible area
    const minX = invVpt[4];
    const minY = invVpt[5];
    const maxX = minX + this.canvas.width! / this.canvas.getZoom();
    const maxY = minY + this.canvas.height! / this.canvas.getZoom();

    // Padding to ensure documents don't get stuck exactly on the edge
    const padding = 50;

    objects.forEach((obj) => {
      // Generate random coordinates within the visible bounds
      const randomX = Math.random() * (maxX - minX - (obj.width! + padding)) + minX;
      const randomY = Math.random() * (maxY - minY - (obj.height! + padding)) + minY;

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
   * @returns A fabric.Rect object.
   */
  public create_box(rect: any, fill: string): fabric.Rect {
    return new fabric.Rect({
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
    return thing.backgroundColor == '#F0C086';
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
      this.canvas.loadFromJSON(this.canvas_states[this.current_state_index], () => {
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
      this.canvas.loadFromJSON(this.canvas_states[this.current_state_index], () => {
        this.canvas.renderAll();
        this.redo_status = false;
      });
    }
  }

  /**
   * Adds multiple documents to the playground with calculated offsets.
   * @param documents An array of document objects.
   * @returns void
   */
  public add(documents: any[]): void {
    const offset_top = 60;
    const offset_left = 150;
    const spacing = 25;

    let top = (this.canvas.vptCoords as any).tr.y + offset_top;
    const left = (this.canvas.vptCoords as any).tr.x - offset_left;

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
      (active as fabric.ActiveSelection).forEachObject((obj) => this.canvas.remove(obj));
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
    const text = new fabric.Textbox(note, {
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
    const inv = fabric.util.invertTransform(vpt!);
    return {
      x: inv[4] + this.canvas.width! / this.canvas.getZoom() / 2,
      y: inv[5] + this.canvas.height! / this.canvas.getZoom() / 2,
    };
  }

  /**
   * Checks whether the canvas has any items currently selected.
   * @returns boolean
   */
  public has_selection(): boolean {
    return !!this.canvas.getActiveObject();
  }
}
