/**
 * This service handles everything related to fabric and its canvas. The playground component will use
 * this service to visualise this.canvas, which is the fabricjs canvas to show our documents on.
 */
import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { Subject } from 'rxjs';

import { UtilityService } from '@oscc/utility.service';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FabricService {
  public canvas: fabric.Canvas;

  // Variables for keeping track of canvas states
  private canvas_states: any[] = [];
  private current_state_index = -1;
  private undo_status = false;
  private redo_status = false;

  // Subscribable variable that tracks changes to the canvas.
  public canvas_changed_subject: Subject<object> = new Subject<object>();
  canvas_changed$ = this.canvas_changed_subject.asObservable();

  font_size = 16;

  note_array: any[];
  fragment_names: string[];
  documents: any[] = [];

  constructor(private utility: UtilityService) {}

  /**
   * Inits various canvas settings
   */
  public init(): void {
    this.resize();
    this.canvas.freeDrawingBrush.color = 'black';
    this.canvas.freeDrawingBrush.width = 10;
  }

  /**
   * Resizes the canvas based on the dimensions of the browser window
   */
  public resize(): void {
    this.canvas.setDimensions({ width: window.innerWidth - 25, height: window.innerHeight });
  }

  /**
   * Sets the event handlers for the canvas, such as scrolling, zooming,
   * panning and selecting.
   */
  public set_event_handlers(): void {
    this.canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      this.canvas.requestRenderAll();
    });
    /**
     * When control is pressed down, we will drag the canvas
     * If not, we allow selection of multiple objects
     */
    this.canvas.on('mouse:down', function (opt: any) {
      const evt = opt.e;
      if (evt.shiftKey === true) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });
    this.canvas.on('mouse:move', function (opt: any) {
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
      // Whenever we move a fragment, we set its colour. This allows the distinction between existing and new fragments
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && this.is_document(activeObject)) {
        activeObject._objects[0].set('fill', '#9BA8F2'); // Change color to blue
        this.canvas.renderAll();
      }
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      // FIXME: because of this, a selected object does not stay selected...
      this.canvas_changed_subject.next({});
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.canvas.isDragging = false;
      this.canvas.selection = true;
    });

    // On object add, delete and modify, save the canvas state for undo and redo
    // The "() =>:" notation preserves the context of THIS.
    this.canvas.on('object:added', () => {
      if (!this.undo_status && !this.redo_status) {
        this.save_state();
      }
    });
    this.canvas.on('object:modified', () => {
      if (!this.undo_status && !this.redo_status) {
        this.save_state();
      }
    });
    this.canvas.on('object:removed', () => {
      if (!this.undo_status && !this.redo_status) {
        this.save_state();
      }
    });
  }

  /**
   * Toggles canvas drawing mode
   */
  public toggle_drawing_mode(): void {
    this.canvas.isDrawingMode = !this.canvas.isDrawingMode;
  }

  /**
   * Creates a document header
   * @param doc (document)
   * @param font_size (number)
   * @return fabric.Text
   */
  public create_header(doc: any, font_size: number): fabric.Text {
    const header_text = `${this.utility.capitalize_word(doc.document_type)} ${doc.name}`;
    const header = new fabric.Text(header_text, {
      fontSize: font_size,
      fontWeight: 'bold',
      originX: 'left',
      originY: 'bottom',
    });
    return header;
  }

  /**
   * Creates the text for a fabric object
   * @param doc (document)
   * @param font_size (number)
   * @return fabric.Text
   */
  public create_text(doc: any, font_size: number): fabric.Text {
    return new fabric.Textbox(doc.text, {
      originX: 'left',
      width: 300,
      fontSize: font_size,
    });
  }

  /**
   * Creates the lines for a fabric object
   * @param doc (document)
   * @param font_size (number)
   * @return fabric.Text
   */
  public create_lines(doc: any, font_size: number): fabric.Text {
    let lines_text = '';
    doc.lines.forEach((line: any) => {
      lines_text += `${line.line_number}: ${line.text}\n`;
    });
    // Remove the last superfluous carriage return (I have no idea why -1 instead of -2)
    lines_text = lines_text.slice(0, -1);

    // Get the positions of the cursive text
    const positions = this.get_style_positions(lines_text, '$');
    // Remove the delimiters from the text
    lines_text = lines_text.split('$').join('');

    const lines = new fabric.IText(lines_text, {
      fontSize: font_size,
      originX: 'left',
    });

    // We removed the delimiters, so after every tuple, we need to subtract two additional positions from
    // the positions inside the tuples to compensate for the removed delimiters.
    let tuple_counter = 0;
    positions.forEach((tuple: any) => {
      lines.setSelectionStyles({ fontStyle: 'italic' }, tuple[0] - tuple_counter, tuple[1] - tuple_counter);
      tuple_counter += 2;
    });
    return lines;
  }

  /**
   * Returns the positions where style delimiters are in the given string.
   * For example, for the string "h$e$llo $there$", [[1,3],[8,14]] is returned
   * @param text (string)
   * @param delmiter (string)
   * @return list of tuples
   */
  private get_style_positions(lines_text: string, delimiter: string) {
    const positions: number[] = [];
    let index = lines_text.indexOf(delimiter);

    while (index !== -1) {
      positions.push(index);
      index = lines_text.indexOf(delimiter, index + 1);
    }

    const tuples = positions.reduce((acc: [number][], value: number, index: number) => {
      if (index % 2 === 0) {
        // Start a new tuple with the current number
        acc.push([value]);
      } else {
        // Add the current number to the last tuple in acc
        const lastTuple = acc[acc.length - 1];
        lastTuple.push(value);
      }
      return acc;
    }, []);

    return tuples;
  }

  public create_box(text_bounding_rect: any, fill: string): fabric.Rect {
    return new fabric.Rect({
      top: text_bounding_rect.top,
      left: text_bounding_rect.left,
      width: text_bounding_rect.width,
      height: text_bounding_rect.height,
      fill: fill,
      rx: 10,
      ry: 10,
      stroke: 'black',
      strokeWidth: 1,
    });
  }

  /**
   * Checks if the given object is a document
   * @param thing (object)
   * @return boolean
   */
  public is_document(thing: any): boolean {
    return 'identifier' in thing;
    //thing.backgroundColor == '#F0C086';
  }

  /**
   * Saves the current canvas state to the canvas_states class property
   */
  private save_state(): void {
    if (this.current_state_index < this.canvas_states.length - 1) {
      const indexToBeInserted = this.current_state_index + 1;
      this.canvas_states.splice(indexToBeInserted, this.canvas_states.length - indexToBeInserted);
    }
    this.canvas_states.push(JSON.stringify(this.canvas));
    this.current_state_index = this.canvas_states.length - 1;
  }

  /**
   * This function allows the playground to delete documents from the canvas
   */
  public delete_selected(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'activeSelection') {
        // If it's a group of objects, remove each one
        activeObject.getObjects().forEach((item: any) => {
          this.canvas.remove(item);
        });
        // Discard the active selection too
        this.canvas.discardActiveObject();
      } else {
        // If it's a single object, remove it
        this.canvas.remove(activeObject);
      }
    }
  }

  /**
   * Undoes the canvas by moving back in the saved states
   */
  public undo(): void {
    if (this.current_state_index <= 0) {
      return;
    }
    this.undo_status = true;
    this.canvas.loadFromJSON(this.canvas_states[this.current_state_index - 1], () => {
      this.canvas.renderAll();
      this.undo_status = false;
      this.current_state_index -= 1;
    });
  }

  /**
   * Redoes the canvas by moving forward in the saved states
   */
  public redo(): void {
    if (this.current_state_index >= this.canvas_states.length - 1) {
      return;
    }
    this.redo_status = true;
    this.canvas.loadFromJSON(this.canvas_states[this.current_state_index + 1], () => {
      this.canvas.renderAll();
      this.redo_status = false;
      this.current_state_index += 1;
    });
  }

  /**
   * Adds the given documents to the playground
   * @param documents (list)
   */
  public add(documents: any): void {
    const offset_top = 60;
    const offset_left = 150;
    const offset_next_document = 25;
    let top = this.canvas.vptCoords.tr.y + offset_top;

    documents.forEach((doc: any) => {
      this.documents.push(doc);
      if (doc.document_type == environment.fragment) {
        this.add_fragment(doc, top, this.canvas.vptCoords.tr.x - offset_left);
      } else if (doc.document_type == environment.testimonium) {
        this.add_testimonium(doc, top, this.canvas.vptCoords.tr.x - offset_left);
      }
      top += offset_next_document;
    });
  }

  /**
   * Clears the entire playground
   */
  public clear() {
    this.documents = [];
    this.note_array = [];
    this.canvas.clear();
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
   * Adds the given note to the canvas
   */
  public add_note(note: string): void {
    const text = new fabric.Textbox(note, {
      top: this.get_center().y,
      left: this.get_center().x,
      width: 200,
      fontSize: this.font_size,
      textAlign: 'left', // you can use specify the text align
      backgroundColor: '#F0C086',
      editable: true,
    });
    this.canvas.add(text);
  }

  /**
   * Adds the given fragment to the canvas
   */
  private add_fragment(fragment: any, top: number, left: number): void {
    const fill = '#3F51B5';

    const header = this.create_header(fragment, this.font_size);
    const lines = this.create_lines(fragment, this.font_size);
    const text_group = new fabric.Group([header, lines], {
      hasBorders: true,
      padding: 10,
    });
    const text_bounding_rect = text_group.getBoundingRect();
    const box = this.create_box(text_bounding_rect, fill);
    const group = new fabric.Group([box, text_group], {
      top: top,
      left: left,
      // We save the document identifier for finding the document in this.documents whenever we need it for something
      identifier: { author: fragment.author, title: fragment.title, editor: fragment.editor, name: fragment.name },
    });

    this.canvas.add(group);
  }

  /**
   * Adds the given fragment to the canvas
   * @author Ycreak
   */
  private add_testimonium(testimonium: any, top: number, left: number): void {
    const fill = 'orange';

    const header = this.create_header(testimonium, this.font_size);
    const lines = this.create_text(testimonium, this.font_size);
    const text_group = new fabric.Group([header, lines], {
      hasBorders: true,
      padding: 10,
    });
    const text_bounding_rect = text_group.getBoundingRect();
    const box = this.create_box(text_bounding_rect, fill);
    const group = new fabric.Group([box, text_group], {
      top: top,
      left: left,
      // We save the document identifier for finding the document in this.documents whenever we need it for something
      identifier: {
        author: testimonium.author,
        title: testimonium.title,
        editor: testimonium.editor,
        name: testimonium.name,
      },
    });
    this.canvas.add(group);
  }

  /**
   * Returns the center of the canvas
   */
  private get_center() {
    const zoom = this.canvas.getZoom();
    return {
      x: fabric.util.invertTransform(this.canvas.viewportTransform)[4] + this.canvas.width / zoom / 2,
      y: fabric.util.invertTransform(this.canvas.viewportTransform)[5] + this.canvas.height / zoom / 2,
    };
  }

  /**
   * Checks whether the canvas has selected items
   * @return boolean
   */
  public has_selection(): boolean {
    const activeObject = this.canvas.getActiveObject();
    return activeObject !== null && activeObject !== undefined;
  }
}
