import { fabric } from 'fabric';
import { environment } from '@src/environments/environment';

// Service imports
import { FabricService } from '@oscc/playground/services/fabric.service';

export class Playground {
  _id: string;
  name: string;
  owner: string;
  user: string;
  shared_with: string[];
  canvas: fabric.Canvas;

  // Variables for keeping track of canvas states
  private canvas_states: any[] = [];
  private current_state_index = -1;
  private undo_status = false;
  private redo_status = false;

  font_size = 16;

  note_array: any[];
  fragment_names: string[];
  documents: any[] = [];

  // Deprecate this
  note: string;

  author: string;
  title: string;
  editor: string;
  name2: string;

  retrieved_titles: string[];
  retrieved_editors: string[];

  constructor(private fabric: FabricService) {}

  /**
   * Inits various canvas settings
   * @author Ycreak
   */
  public init(): void {
    this.resize();
    this.canvas.freeDrawingBrush.color = 'black';
    this.canvas.freeDrawingBrush.width = 10;
  }

  /**
   * Resizes the canvas based on the dimensions of the browser window
   * @author Ycreak
   */
  public resize(): void {
    this.canvas.setDimensions({ width: window.innerWidth - 25, height: window.innerHeight });
  }

  /**
   * Clears the entire playground
   * @author Ycreak
   */
  public clear() {
    this.documents = [];
    this.note_array = [];
    this.canvas.clear();
  }

  /**
   * Adds the given documents to the playground
   * @param documents (list)
   * @author Ycreak
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
   * This function allows the playground to delete notes and fragements
   * @author Ycreak
   */
  public delete_selected(): void {
    this.canvas.getActiveObjects().forEach((item: any) => {
      this.canvas.remove(item);
    });
  }

  /**
   * Checks whether the canvas has selected items
   * @return boolean
   * @author Ycreak
   */
  public has_selection(): boolean {
    return this.canvas.getActiveObjects().length > 0;
  }

  /**
   * Returns the center of the canvas
   * @author Ycreak
   */
  private get_center() {
    const zoom = this.canvas.getZoom();
    return {
      x: fabric.util.invertTransform(this.canvas.viewportTransform)[4] + this.canvas.width / zoom / 2,
      y: fabric.util.invertTransform(this.canvas.viewportTransform)[5] + this.canvas.height / zoom / 2,
    };
  }

  /**
   * Adds the given note to the canvas
   * @author Ycreak
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
   * @author Ycreak
   */
  private add_fragment(fragment: any, top: number, left: number): void {
    const fill = '#3F51B5';

    const header = this.fabric.create_header(fragment, this.font_size);
    const lines = this.fabric.create_lines(fragment, this.font_size);
    const text_group = new fabric.Group([header, lines], {
      hasBorders: true,
      padding: 10,
    });
    const text_bounding_rect = text_group.getBoundingRect();
    const box = this.fabric.create_box(text_bounding_rect, fill);
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

    const header = this.fabric.create_header(testimonium, this.font_size);
    const lines = this.fabric.create_text(testimonium, this.font_size);
    const text_group = new fabric.Group([header, lines], {
      hasBorders: true,
      padding: 10,
    });
    const text_bounding_rect = text_group.getBoundingRect();
    const box = this.fabric.create_box(text_bounding_rect, fill);
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
   * Sets the event handlers for the canvas, such as scrolling, zooming,
   * panning and selecting.
   * @author Ycreak
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
   * Saves the current canvas state to the canvas_states class property
   * @author Ycreak
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
   * Undoes the canvas by moving back in the saved states
   * @author Ycreak
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
   * @author Ycreak
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
   * Toggles canvas drawing mode
   * @author Ycreak
   */
  public toggle_drawing_mode(): void {
    this.canvas.isDrawingMode = !this.canvas.isDrawingMode;
  }

  /**
   * Checks if the given object is a note
   * @param thing (object)
   * @return boolean
   * @author Ycreak
   */
  public is_note(thing: any): boolean {
    return thing.backgroundColor == '#F0C086';
  }

  /**
   * Checks if the given object is a document
   * @param thing (object)
   * @return boolean
   * @author Ycreak
   */
  public is_document(thing: any): boolean {
    return 'identifier' in thing;
    //thing.backgroundColor == '#F0C086';
  }
}
