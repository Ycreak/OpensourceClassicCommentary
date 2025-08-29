/* The playground component holds all logic regarding the playground, including the fabricjs canvas,
 * the save and open buttons and all other components that are part of the playground. These components
 * are found inside this folder, but are not in this file. This component should just be the host to all
 * these individual components. Additionally, it holds information about the currently loaded playground,
 * like its name and its users. The canvas is fully handled by the fabric service.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { WebsocketsService } from '@oscc/playground/websockets.service';
import { HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

//import * as fabric from 'fabric';
import { fabric } from 'fabric';
import { Subscription } from 'rxjs';

// Service imports
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { CommentaryService } from '@oscc/commentary/commentary.service';
import { UtilityService } from '@oscc/utility.service';
import { FabricService } from './services/fabric.service';

import { FormatterService } from './services/formatter.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { DialogService } from '@oscc/services/dialog.service';
import { Playground_communicator } from '@oscc/models/api/Playground_communicator';

// Component imports
import { LoadPlaygroundComponent } from './load-playground/load-playground.component';
import { SavePlaygroundComponent } from './save-playground/save-playground.component';
import { DeletePlaygroundComponent } from './delete-playground/delete-playground.component';
import { SharePlaygroundComponent } from './share-playground/share-playground.component';
import { JoinPlaygroundComponent } from './join-playground/join-playground.component';
import { DocumentFilterComponent } from '@oscc/filters/document-filter/document-filter.component';
import { Playground_user } from '@oscc/models/api/Playground_user';

@Component({
  standalone: false,
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit, OnDestroy {
  @Output() document_clicked = new EventEmitter<Fragment>();
  // Listener for key events
  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.fabric.delete_selected();
    } else if ((event.ctrlKey || event.metaKey) && event.key == 'Z') {
      // Redo the canvas on Ctrl+Shift+Z
      this.fabric.redo();
    } else if ((event.ctrlKey || event.metaKey) && event.key == 'z') {
      // Undo the canvas on Ctrl+Z
      this.fabric.undo();
    }
  }
  // Listener for window resize evenets
  @HostListener('window:resize', ['$event'])
  onResize() {
    // If we resize the window, we want the canvas to resize as well
    this.fabric.resize();
  }

  // Information about the current playground
  private _id: string;
  private name: string;
  protected role: string;
  private users: Playground_user[];
  private shared_with: string[];
  private created_by: string;

  private canvas_change_subscription: Subscription;
  private websockets_subscription: Subscription;

  constructor(
    protected api: ApiService,
    protected auth_service: AuthService,
    protected dialog: DialogService,
    protected fabric: FabricService,
    protected utility: UtilityService,
    protected websockets: WebsocketsService,
    private commentary: CommentaryService,
    private formatter: FormatterService,
    private mat_dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.init_playground();
    //this.request_documents({ document_type: 'fragment', author: 'Karel' });
  }

  ngOnDestroy() {
    if (this.canvas_change_subscription) {
      this.canvas_change_subscription.unsubscribe();
    }
    // Close the websocket
    this.disconnect_from_websocket();
  }

  /**
   * Opens a dialog to set an advanced filter. If filter set, requests documents from server
   * @param number of column_id to load documents into
   * @author Ycreak
   */
  protected open_advanced_filter(): void {
    const dialogRef = this.mat_dialog.open(DocumentFilterComponent, {});
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result && result.filters.length) {
          //TODO: for now, we need to request every single document from the server.
          // New API update will allow us to request a list of filters
          result.filters.forEach((filter: any) => {
            this.request_documents(filter);
          });
        }
      },
    });
  }

  /**
   * Request the API for documents: add them to the playground
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_documents(filter: any): void {
    // Only retrieve documents that are visible
    filter.visible = 1;
    this.api.request_documents(filter).subscribe((documents) => {
      // Format documents
      documents.forEach((doc: any) => {
        this.formatter.format(doc);
      });
      // Place the documents on the canvas
      this.fabric.add(documents);
    });
  }

  /**
   * @author CptVickers
   */
  protected open_clear_playground(): void {
    this.dialog.open_confirmation_dialog('Are you sure you want to clear the playground?', '').subscribe({
      next: (res) => {
        if (res) {
          this.fabric.clear();
        }
      },
    });
  }

  /**
   * Opens the load playground dialog. If it returns with a name, we retrieve that playground from
   * the server.
   * @author Ycreak
   */
  protected load_playground(): void {
    const dialogRef = this.mat_dialog.open(LoadPlaygroundComponent, {
      data: { user: this.auth_service.current_user_name },
    });
    dialogRef.afterClosed().subscribe({
      next: (requested_playground_id: string) => {
        if (requested_playground_id) {
          this.api
            .request_documents(new Playground_communicator({ _id: requested_playground_id }))
            .subscribe((playground) => {
              if (playground.length > 0) {
                this.process_incoming_playground(playground[0]);
                this.utility.open_snackbar(`Playground ${this.name} opened.`);
              } else {
                this.utility.open_snackbar('Corrupt playground received from server.');
              }
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
      data: { name: this.name },
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        if (data.button == 'save') {
          if (this.role == 'owner' || this.role == 'collaborator') {
            this.api.post_document(
              new Playground_communicator({
                name: data.name,
                canvas: this.fabric.canvas.toJSON(),
                _id: this._id,
              }),
              'update'
            );
          } else {
            this.utility.open_snackbar('Not enough permissions');
          }
        } else if (data.button == 'create') {
          this.api
            .post_document(
              new Playground_communicator({
                name: data.name,
                canvas: this.fabric.canvas.toJSON(),
                created_by: this.auth_service.current_user_name,
                users: [
                  new Playground_user({
                    name: this.auth_service.current_user_name,
                    role: 'owner',
                  }),
                ],
              }),
              'create'
            )
            .subscribe((playground) => {
              this.process_incoming_playground(playground);
              this.utility.open_snackbar(`Playground ${this.name} created.`);
            });
        }
      }
    });
  }

  /**
   * Opens a dialog to join a live room.
   */
  protected join_playground(): void {
    const dialogRef = this.mat_dialog.open(JoinPlaygroundComponent, {
      data: { name: this.auth_service.current_user_name },
    });
    dialogRef.afterClosed().subscribe({
      next: (room_identifier: string) => {
        if (room_identifier) {
          // Disconnect from any existing websocket connections
          this.disconnect_from_websocket();
          // And join the newly given live room
          this.join_live_room(room_identifier);
        }
      },
    });
  }
  /**
   * Joins the given websockets room. Will send the playground canvas to the websocket on every
   * canvas change and will load the playground canvas whenever one is received from the server.
   */
  protected join_live_room(room_identifier: string): void {
    // Join the generated websockets room
    this.websockets.room_identifier = room_identifier;
    this.websockets.connect(room_identifier);

    // Take a subscription to the websocket with the generated room number
    this.websockets.active = true;
    this.websockets_subscription = this.websockets.get_messages().subscribe((message) => {
      this.fabric.canvas.loadFromJSON(message, this.fabric.canvas.renderAll.bind(this.fabric.canvas));
    });
    // Take a subscription to canvas changes. These we will send to the websocket
    this.canvas_change_subscription = this.fabric.canvas_changed_subject.subscribe(() => {
      this.websockets.send_json(this.fabric.canvas.toJSON());
    });
  }

  /**
   * Creates a live room by generating a room identifier and joining said room.
   * @author Ycreak
   */
  protected create_live_room(): void {
    this.disconnect_from_websocket();
    // First, generate a string and provide it to the user as being the share string
    this.websockets.room_identifier = (Math.random() + 1).toString(36).substring(7);
    this.utility.open_snackbar(`The share code is: ${this.websockets.room_identifier}`);
    this.join_live_room(this.websockets.room_identifier);
  }

  /**
   * Disconnects fully and gracefully from the currently connected websocket
   * @author Ycreak
   */
  private disconnect_from_websocket(): void {
    if (this.websockets_subscription) {
      this.websockets_subscription.unsubscribe();
      this.websockets.disconnect(this.websockets.room_identifier);
      this.websockets.active = false;
    }
  }

  /**
   * Opens the share playground dialog. If accepted, we share the current playground with the given users.
   * @author Ycreak
   */
  protected share_playground(): void {
    if (this.name) {
      const dialogRef = this.mat_dialog.open(SharePlaygroundComponent, { data: { users: this.users } });
      dialogRef.afterClosed().subscribe({
        next: (users: Playground_user[]) => {
          if (users) {
            this.users = users;
            this.api.post_document(
              new Playground_communicator({
                _id: this._id,
                users: this.users,
              }),
              'update'
            );
          }
        },
      });
    } else {
      this.utility.open_snackbar('No playground selected');
    }
  }

  /**
   * Opens the delete playground dialog. If accepted, we delete the current playground.
   * @author Ycreak
   */
  protected delete_playground(): void {
    if (this.name) {
      const dialogRef = this.mat_dialog.open(DeletePlaygroundComponent, {
        data: { name: this.name },
      });
      dialogRef.afterClosed().subscribe({
        next: (name: any) => {
          if (name) {
            // Check if we have the correct rights to delete the playground
            if (this.role === 'owner') {
              //this.api.post_document(new Playground_communicator({ _id: this._id }), 'delete');
              this.api.post_document(new Playground_communicator({ _id: this._id }), 'delete').subscribe(() => {});
              // Reset the playground to a clean slate
              this.fabric.clear();
              this.role = undefined;
            } else {
              this.utility.open_snackbar('Not allowed');
            }
          }
        },
      });
    } else {
      this.utility.open_snackbar('No playground selected');
    }
  }

  /**
   * Requests the commentary for the clicked document. Will check which document has been clicked,
   * find said document in the this.documents array and then request the commentary component for a commentary.
   * @author Ycreak
   */
  protected request_commentary(): void {
    const clicked_document = this.fabric.canvas.getActiveObjects()[0];
    if (!this.fabric.is_note(clicked_document)) {
      const full_document = this.utility.filter_array(this.fabric.documents, clicked_document.identifier)[0];
      if (full_document) {
        this.commentary.request(full_document);
        window.scroll(0, 0);
      } else {
        this.utility.open_snackbar('Commentary not found.');
      }
    } else {
      this.utility.open_snackbar('I am a note.');
    }
  }

  /**
   * Sets up everything correctly for an incoming playground
   * @param playground (Playground) from the API
   * @author Ycreak
   */
  private process_incoming_playground(playground: any): void {
    this.name = playground.name;
    this.created_by = playground.created_by;

    // Find the role of the current user in the provided playground
    this.role = playground.users.filter((item: any) => item.name === this.auth_service.current_user_name)[0].role;

    this._id = playground._id;
    this.users = playground.users;
    // Apply data to the canvas
    this.fabric.canvas.clear();
    this.fabric.canvas.loadFromJSON(playground.canvas, this.fabric.canvas.renderAll.bind(this.fabric.canvas));
  }

  /**
   * Inits the playground object
   * @author Ycreak
   */
  private init_playground(): void {
    this.fabric.canvas = new fabric.Canvas('playground_canvas');
    this.fabric.set_event_handlers();
    this.fabric.init();
  }
}
