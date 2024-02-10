import { Component, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
//import { WebsocketsService } from '@oscc/playground/websockets.service';
import { HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { fabric } from 'fabric';

// Service imports
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { CommentaryService } from '@oscc/commentary/commentary.service';
import { UtilityService } from '@oscc/utility.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { DialogService } from '@oscc/services/dialog.service';
import { Playground } from '@oscc/models/Playground';

// Component imports
import { LoadPlaygroundComponent } from './load-playground/load-playground.component';
import { SavePlaygroundComponent } from './save-playground/save-playground.component';
import { DeletePlaygroundComponent } from './delete-playground/delete-playground.component';
import { SharePlaygroundComponent } from './share-playground/share-playground.component';
import { JoinPlaygroundComponent } from './join-playground/join-playground.component';
import { DocumentFilterComponent } from '@oscc/filters/document-filter/document-filter.component';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit {
  @Output() document_clicked = new EventEmitter<Fragment>();
  // Listener for key events
  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.delete_clicked_objects();
    } else if ((event.ctrlKey || event.metaKey) && event.key == 'Z') {
      // Redo the canvas on Ctrl+Shift+Z
      this.redo();
    } else if ((event.ctrlKey || event.metaKey) && event.key == 'z') {
      // Undo the canvas on Ctrl+Z
      this.undo();
    }
  }
  // Listener for window resize evenets
  @HostListener('window:resize', ['$event'])
  onResize() {
    // If we resize the window, we want the canvas to resize as well
    this.resize_canvas();
  }

  // Playground column that keeps all data related to said playground
  protected playground: Playground;
  // We keep track of all documents in the playground. We can then search through this array for data like commentaries.
  private documents: any[] = [];

  // Variables for keeping track of canvas states
  private canvas_states: any[] = [];
  private current_state_index = -1;
  private undo_status = false;
  private redo_status = false;

  constructor(
    private auth_service: AuthService,
    private commentary: CommentaryService,
    protected api: ApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    private mat_dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.playground = new Playground({});
    this.playground.canvas = new fabric.Canvas('playground_canvas');
    this.set_canvas_event_handlers();
    this.init_canvas_settings();

    this.request_documents({ title: 'Eumenides' });
  }

  /**
   * Opens a dialog to set a custom filter. If filter set, requests documents from server
   * @param number of column_id to load documents into
   * @author Ycreak
   */
  protected filter_documents(): void {
    const dialogRef = this.mat_dialog.open(DocumentFilterComponent, {});
    dialogRef.afterClosed().subscribe({
      next: (filters) => {
        if (filters.length) {
          //TODO: for now, we need to request every single document from the server.
          // New API update will allow us to request a list of filters
          filters.forEach((filter: any) => {
            this.request_documents(filter);
          });
        }
      },
    });
  }

  /**
   * Request the API for documents: add them to the given column
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_documents(filter: object): void {
    this.api.get_documents(filter).subscribe((documents) => {
      this.process_incoming_documents(documents);
      // Place the first document at the following height in the canvas. Every following fragment will be placed a
      // little bit lower to give a stacking effect for newly arrived fragments.
      const offset_top = 60;
      const offset_left = 150;
      const step_next_document = 25;
      let top = this.playground.canvas.vptCoords.tr.y + offset_top;
      documents.forEach((document: any) => {
        this.documents.push(document);
        this.add_document_to_canvas(document, top, this.playground.canvas.vptCoords.tr.x - offset_left);
        top += step_next_document;
      });
    });
  }

  /**
   * Processes incoming documents: adds html, sorts documents and puts them in the given column.
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   * @author Ycreak
   */
  private process_incoming_documents(documents: any[]): void {
    // Replace the <n> tag for spaces by actual spaces
    documents.forEach((doc: any) => {
      doc.lines.forEach((line: any) => {
        const matches = line.text.match(/<(\d+)>/);
        // If found, replace it with the correct whitespace number
        if (matches) {
          // Add n spaces. n can be found in matches[1]
          const replacement = ''.padStart(matches[1], '  ');
          line.text = line.text.replace(matches[0], replacement);
        }
      });
    });
    this.playground.documents.push(documents[0]);
  }

  /**
   * This function allows the playground to delete notes and fragements
   * @author Ycreak
   */
  protected delete_clicked_objects(): void {
    this.playground.canvas.getActiveObjects().forEach((item: any) => {
      this.playground.canvas.remove(item);
    });
  }

  /**
   * Checks whether the canvas has selected items
   * @return boolean
   * @author Ycreak
   */
  protected canvas_has_selection(): boolean {
    return this.playground.canvas.getActiveObjects().length > 0;
  }

  /**
   * @author CptVickers
   */
  protected clear_playground(): void {
    this.dialog.open_confirmation_dialog('Are you sure you want to clear the playground?', '').subscribe({
      next: (res) => {
        if (res) {
          this.playground.clear();
        }
      },
    });
  }

  /**
   * Adds the given note to the canvas
   * @author Ycreak
   */
  protected add_note_to_canvas(note: string): void {
    const text = new fabric.Textbox(note, {
      top: this.find_canvas_center().y,
      left: this.find_canvas_center().x,
      width: 200,
      fontSize: this.playground.font_size,
      textAlign: 'left', // you can use specify the text align
      backgroundColor: '#F0C086',
      editable: true,
    });
    this.playground.canvas.add(text);
  }

  /**
   * Adds the given fragment to the canvas
   * @author Ycreak
   */
  private add_document_to_canvas(fragment: any, top: number, left: number): void {
    const header_text = `Fragment ${fragment.name}`;
    const header = new fabric.Text(header_text, {
      fontSize: this.playground.font_size,
      fontWeight: 'bold',
      originX: 'left',
      originY: 'bottom',
    });
    let lines_text = '';
    fragment.lines.forEach((line: any) => {
      lines_text += `${line.line_number}: ${line.text}\n`;
    });
    const lines = new fabric.Text(lines_text, {
      fontSize: this.playground.font_size,
      originX: 'left',
    });
    const text_group = new fabric.Group([header, lines], {
      backgroundColor: 'green',
      fill: 'red',
      hasBorders: true,
      padding: 10,
    });
    const textBoundingRect = text_group.getBoundingRect();
    const background_and_border = new fabric.Rect({
      top: textBoundingRect.top,
      left: textBoundingRect.left,
      width: textBoundingRect.width,
      height: textBoundingRect.height,
      fill: 'orange',
      rx: 10,
      ry: 10,
      stroke: 'black',
      strokeWidth: 1,
    });

    const group = new fabric.Group([background_and_border, text_group], {
      top: top,
      left: left,
      // We save the document identifier for finding the document in this.documents whenever we need it for something
      identifier: { author: fragment.author, title: fragment.title, editor: fragment.editor, name: fragment.name },
    });
    this.playground.canvas.add(group);
  }

  /**
   * Returns the center of the canvas
   * @author Ycreak
   */
  private find_canvas_center() {
    const zoom = this.playground.canvas.getZoom();
    return {
      x:
        fabric.util.invertTransform(this.playground.canvas.viewportTransform)[4] +
        this.playground.canvas.width / zoom / 2,
      y:
        fabric.util.invertTransform(this.playground.canvas.viewportTransform)[5] +
        this.playground.canvas.height / zoom / 2,
    };
  }

  /**
   * Inits various canvas settings
   * @author Ycreak
   */
  private init_canvas_settings(): void {
    this.resize_canvas();
    this.playground.canvas.freeDrawingBrush.color = 'black';
    this.playground.canvas.freeDrawingBrush.width = 10;
  }

  /**
   * Resizes the canvas based on the dimensions of the browser window
   * @author Ycreak
   */
  private resize_canvas(): void {
    this.playground.canvas.setDimensions({ width: window.innerWidth - 25, height: window.innerHeight });
  }

  /**
   * Sets the event handlers for the canvas, such as scrolling, zooming,
   * panning and selecting.
   * @author Ycreak
   */
  private set_canvas_event_handlers(): void {
    this.playground.canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = this.playground.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.playground.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      this.playground.canvas.requestRenderAll();
    });
    /**
     * When control is pressed down, we will drag the canvas
     * If not, we allow selection of multiple objects
     */
    this.playground.canvas.on('mouse:down', function (opt: any) {
      const evt = opt.e;
      if (evt.shiftKey === true) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });
    this.playground.canvas.on('mouse:move', function (opt: any) {
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
    this.playground.canvas.on('mouse:up', () => {
      // Whenever we move a fragment, we set its colour. This allows the distinction between existing and new fragments
      const activeObject = this.playground.canvas.getActiveObject();
      if (activeObject) {
        activeObject._objects[0].set('fill', '#9BA8F2'); // Change color to blue
        this.playground.canvas.renderAll();
      }
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      this.playground.canvas.setViewportTransform(this.playground.canvas.viewportTransform);
      this.playground.canvas.isDragging = false;
      this.playground.canvas.selection = true;
    });

    // On object add, delete and modify, save the canvas state for undo and redo
    // The "() =>:" notation preserves the context of THIS.
    this.playground.canvas.on('object:added', () => {
      if (!this.undo_status && !this.redo_status) {
        this.save_canvas_state();
      }
    });
    this.playground.canvas.on('object:modified', () => {
      if (!this.undo_status && !this.redo_status) {
        this.save_canvas_state();
      }
    });
    this.playground.canvas.on('object:removed', () => {
      if (!this.undo_status && !this.redo_status) {
        this.save_canvas_state();
      }
    });
  }

  /**
   * Saves the current canvas state to the canvas_states class property
   * @author Ycreak
   */
  private save_canvas_state(): void {
    if (this.current_state_index < this.canvas_states.length - 1) {
      const indexToBeInserted = this.current_state_index + 1;
      this.canvas_states.splice(indexToBeInserted, this.canvas_states.length - indexToBeInserted);
    }
    this.canvas_states.push(JSON.stringify(this.playground.canvas));
    this.current_state_index = this.canvas_states.length - 1;
  }

  /**
   * Undoes the canvas by moving back in the saved states
   * @author Ycreak
   */
  protected undo(): void {
    if (this.current_state_index <= 0) {
      return;
    }
    this.undo_status = true;
    this.playground.canvas.loadFromJSON(this.canvas_states[this.current_state_index - 1], () => {
      this.playground.canvas.renderAll();
      this.undo_status = false;
      this.current_state_index -= 1;
    });
  }

  /**
   * Redoes the canvas by moving forward in the saved states
   * @author Ycreak
   */
  protected redo(): void {
    if (this.current_state_index >= this.canvas_states.length - 1) {
      return;
    }
    this.redo_status = true;
    this.playground.canvas.loadFromJSON(this.canvas_states[this.current_state_index + 1], () => {
      this.playground.canvas.renderAll();
      this.redo_status = false;
      this.current_state_index += 1;
    });
  }

  /**
   * Toggles canvas drawing mode
   * @author Ycreak
   */
  protected toggle_drawing_mode(): void {
    this.playground.canvas.isDrawingMode = !this.playground.canvas.isDrawingMode;
  }

  /**
   * Opens the load playground dialog. If it returns with a name, we retrieve that playground from
   * the server.
   * @author Ycreak
   */
  protected load_playground(): void {
    const dialogRef = this.mat_dialog.open(LoadPlaygroundComponent, {
      data: { owner: this.auth_service.current_user_name },
    });
    dialogRef.afterClosed().subscribe({
      next: (name: any) => {
        if (name) {
          this.api
            .get_playground({ owner: this.auth_service.current_user_name, name: name })
            .subscribe((playground) => {
              this.playground.name = playground.name;
              this.playground.shared_with = playground.shared_with;
              this.playground._id = playground._id;
              this.playground.owner = playground.owner;
              // Apply data to the canvas
              this.playground.canvas.clear();
              this.playground.canvas.loadFromJSON(
                playground.canvas,
                this.playground.canvas.renderAll.bind(this.playground.canvas)
              );
            });
        }
      },
    });
  }

  /**
   * Opens the save playground dialog. It returns with a create or save request and a name to save/create to.
   * Accordingly, a playground with given name is created/saved. Error handling is done on the server
   * @author Ycreak
   */
  protected save_playground(): void {
    const dialogRef = this.mat_dialog.open(SavePlaygroundComponent, {
      data: { name: this.playground.name },
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const playground = new Playground({
          _id: this.playground._id,
          owner: this.auth_service.current_user_name,
          name: data.name,
          canvas: this.playground.canvas.toJSON(),
        });
        if (data.button == 'save') {
          this.api.save_playground(playground);
        } else if (data.button == 'create') {
          this.api.create_playground(playground);
        }
      }
    });
  }

  /**
   * Opens the join playground dialog.
   * @author Ycreak
   */
  protected join_playground(): void {
    const dialogRef = this.mat_dialog.open(JoinPlaygroundComponent, {
      data: { name: this.auth_service.current_user_name },
    });
    dialogRef.afterClosed().subscribe({
      next: (playground: any) => {
        if (playground) {
          this.api.get_playground({ user: playground.user, name: playground.name }).subscribe((playground) => {
            this.playground.name = playground.name;
            this.playground.shared_with = playground.shared_with;
            this.playground._id = playground._id;
            this.playground.owner = playground.owner;
            // Apply data to the canvas
            this.playground.canvas.clear();
            this.playground.canvas.loadFromJSON(
              playground.canvas,
              this.playground.canvas.renderAll.bind(this.playground.canvas)
            );
          });
        }
      },
    });
  }
  /**
   * Opens the share playground dialog. If accepted, we share the current playground with the given users.
   * @author Ycreak
   */
  protected share_playground(): void {
    const dialogRef = this.mat_dialog.open(SharePlaygroundComponent, {
      data: { shared_with: this.playground.shared_with },
    });
    dialogRef.afterClosed().subscribe({
      next: (share_with: any) => {
        if (share_with) {
          this.api.save_playground({ _id: this.playground._id, shared_with: share_with });
        }
      },
    });
  }

  /**
   * Opens the delete playground dialog. If accepted, we delete the current playground.
   * @author Ycreak
   */
  protected delete_playground(): void {
    const dialogRef = this.mat_dialog.open(DeletePlaygroundComponent, {
      data: { name: this.playground.name },
    });
    dialogRef.afterClosed().subscribe({
      next: (name: any) => {
        if (name) {
          console.log(this.playground.owner, this.auth_service.current_user_name);
          // Check if we have the correct rights to delete the playground
          if (this.playground.owner === this.auth_service.current_user_name) {
            this.api.delete_playground({ _id: this.playground._id });
          } else {
            this.utility.open_snackbar('Not allowed');
          }
        }
      },
    });
  }

  /**
   * Requests the commentary for the clicked document. Will check which document has been clicked,
   * find said document in the this.documents array and then request the commentary component for a commentary.
   * @author Ycreak
   */
  protected request_commentary(): void {
    const clicked_document = this.playground.canvas.getActiveObjects()[0];
    if (!this.is_note(clicked_document)) {
      console.log(clicked_document);
      const full_document = this.utility.filter_array(this.documents, clicked_document.identifier)[0];
      this.commentary.request(full_document);
      window.scroll(0, 0);
    } else {
      this.utility.open_snackbar('I am a note.');
    }
  }

  /**
   * Checks if the given object is a note
   * @param thing (object)
   * @return boolean
   * @author Ycreak
   */
  private is_note(thing: any): boolean {
    return thing.backgroundColor == '#F0C086';
  }
}
