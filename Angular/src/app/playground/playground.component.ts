import { Component, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
//import { WebsocketsService } from '@oscc/playground/websockets.service';
import { HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { fabric } from 'fabric';

// Service imports
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';

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

  protected single_fragment_requested: boolean;
  private new_fragment_location = 10;

  constructor(
    private auth_service: AuthService,
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
  }

  /**
   * Request the API for documents: add them to the given column
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_documents(filter: object): void {
    this.api.get_documents(filter).subscribe((documents) => {
      this.process_incoming_documents(documents);
      documents.forEach((document: any) => {
        this.add_document_to_canvas(document);
      });
    });
  }
  /**
   * Request the API for document names: add them to the playground object
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_document_names(filter: object): void {
    this.api.get_document_names(filter).subscribe((document_names) => {
      this.playground.fragment_names = document_names;
    });
  }
  /**
   * Processes incoming documents: adds html, sorts documents and puts them in the given column.
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   * @author Ycreak
   */
  private process_incoming_documents(documents: any[]): void {
    for (const i in documents) {
      documents[i].add_html_to_lines();
    }
    if (this.single_fragment_requested) {
      this.playground.documents.push(documents[0]);
    } else {
      this.playground.documents = documents;
    }
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

  protected resize() {
    this.playground.canvas.setDimensions({ width: window.innerWidth - 50, height: 100 });
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
   * @param column to which the fragment is to be added
   * @author Ycreak
   */
  protected add_single_fragment(filter: object): void {
    this.single_fragment_requested = true;
    // format the fragment and push it to the list
    this.request_documents(filter);
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
      width: 200,
      fontSize: this.playground.font_size,
      textAlign: 'left', // you can use specify the text align
      backgroundColor: '#ffefd5',
      editable: true,
    });
    this.playground.canvas.add(text);
  }

  /**
   * Adds the given fragment to the canvas
   * @author Ycreak
   */
  private add_document_to_canvas(fragment: any): void {
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
    const group = new fabric.Group([header, lines], {
      top: this.new_fragment_location,
    });
    this.playground.canvas.add(group);
    this.new_fragment_location += 100;
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
    this.playground.canvas.on('mouse:up', function () {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
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
              console.log(playground);
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
}
