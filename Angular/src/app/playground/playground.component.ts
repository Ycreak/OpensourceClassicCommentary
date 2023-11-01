import { Component, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { ColumnHandlerService } from '@oscc/services/column-handler.service';
import { ApiService } from '@oscc/api.service';
//import { WebsocketsService } from '@oscc/playground/websockets.service';
import { environment } from '@src/environments/environment';
import { fabric } from 'fabric';
import { HostListener } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

// Service imports
import { UtilityService } from '@oscc/utility.service';
import { SettingsService } from '@oscc/services/settings.service';
import { AuthService } from '@oscc/auth/auth.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Column } from '@oscc/models/Column';
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
  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.delete_clicked_objects();
    }
  }

  //TODO: refactor this to an object once the playground column is deprecated
  protected playground_name = '';
  private playground_shared_with: any[] = [];
  //private playground_shared_with2: any[] = [{name: 'Sebas', save: true, del: false}, {name: 'Antje', save: false, del: false}];
  private playground_id = '';
  private owner: string;
  // Playground column that keeps all data related to said playground
  playground: Column;
  // Boolean to keep track if we are dragging or clicking a fragment within the playground
  playground_dragging: boolean;
  note: any;

  protected single_fragment_requested: boolean;
  protected canvas: fabric.Canvas;
  private canvas_font_size = 16;
  private new_fragment_location = 10;

  constructor(
    private auth_service: AuthService,
    protected api: ApiService,
    protected utility: UtilityService,
    protected settings: SettingsService,
    protected column_handler: ColumnHandlerService,
    protected dialog: DialogService,
    //protected websockets: WebsocketsService,
    private mat_dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.playground = new Column({ });
    this.canvas = new fabric.Canvas('playground_canvas');
    this.set_canvas_event_handlers();
    this.init_canvas_settings();

    //this.websockets.login();

    //this.websockets.getMessage().subscribe((message) => {
    //console.log('received', message);
    //});
  }

  //protected send_message() {
  //this.websockets.sendMessage({
  //message: 'hello',
  //from: this.auth_service.current_user_name,
  //to: 'all',
  //});
  //}

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
  public delete_clicked_objects(): void {
    this.canvas.getActiveObjects().forEach((item: any) => {
      this.canvas.remove(item);
    });
  }

  /**
   * @param column to which the fragment is to be added
   * @author Ycreak
   */
  public add_single_fragment(filter: object): void {
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
          this.playground.documents = [];
          this.playground.note_array = [];
          this.canvas.clear();
          this.new_fragment_location = 10;
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
      fontSize: this.canvas_font_size,
      textAlign: 'left', // you can use specify the text align
      backgroundColor: '#ffefd5',
      editable: true,
    });
    this.canvas.add(text);
  }

  /**
   * Adds the given fragment to the canvas
   * @author Ycreak
   */
  private add_document_to_canvas(fragment: any): void {
    const header_text = `Fragment ${fragment.name}`;
    const header = new fabric.Text(header_text, {
      fontSize: this.canvas_font_size,
      fontWeight: 'bold',
      originX: 'left',
      originY: 'bottom',
    });
    let lines_text = '';
    fragment.lines.forEach((line: any) => {
      lines_text += `${line.line_number}: ${line.text}\n`;
    });
    const lines = new fabric.Text(lines_text, {
      fontSize: this.canvas_font_size,
      originX: 'left',
    });
    const group = new fabric.Group([header, lines], {
      top: this.new_fragment_location,
    });
    this.canvas.add(group);
    this.new_fragment_location += 100;
  }

  /**
   * Inits various canvas settings
   * @author Ycreak
   */
  private init_canvas_settings(): void {
    this.canvas.freeDrawingBrush.color = 'black';
    this.canvas.freeDrawingBrush.width = 10;
  }

  /**
   * Sets the event handlers for the canvas, such as scrolling, zooming,
   * panning and selecting.
   * @author Ycreak
   */
  private set_canvas_event_handlers(): void {
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
    this.canvas.on('mouse:up', function () {
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
    this.canvas.isDrawingMode = !this.canvas.isDrawingMode;
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
              this.playground_name = playground.name;
              this.playground_shared_with = playground.shared_with;
              this.playground_id = playground._id;
              this.owner = playground.owner;
              // Apply data to the canvas
              this.canvas.clear();
              this.canvas.loadFromJSON(playground.canvas, this.canvas.renderAll.bind(this.canvas));
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
      data: { name: this.playground_name },
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const playground = new Playground({
          _id: this.playground_id,
          owner: this.auth_service.current_user_name,
          name: data.name,
          canvas: this.canvas.toJSON(),
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
            this.playground_name = playground.name;
            this.playground_shared_with = playground.shared_with;
            this.playground_id = playground._id;
            this.owner = playground.owner;
            // Apply data to the canvas
            this.canvas.clear();
            this.canvas.loadFromJSON(playground.canvas, this.canvas.renderAll.bind(this.canvas));
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
      data: { shared_with: this.playground_shared_with },
    });
    dialogRef.afterClosed().subscribe({
      next: (share_with: any) => {
        if (share_with) {
          this.api.save_playground({ _id: this.playground_id, shared_with: share_with });
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
      data: { name: this.playground_name },
    });
    dialogRef.afterClosed().subscribe({
      next: (name: any) => {
        if (name) {
          console.log(this.owner, this.auth_service.current_user_name);
          // Check if we have the correct rights to delete the playground
          if (this.owner === this.auth_service.current_user_name) {
            this.api.delete_playground({ _id: this.playground_id });
          } else {
            this.utility.open_snackbar('Not allowed');
          }
        }
      },
    });
  }
}
