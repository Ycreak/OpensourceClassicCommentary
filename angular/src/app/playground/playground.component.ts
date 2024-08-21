import { Component, OnDestroy, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { WebsocketsService } from '@oscc/playground/websockets.service';
import { HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { fabric } from 'fabric';
import { Subscription } from 'rxjs';

// Service imports
import { ApiService } from '@oscc/api.service';
import { ApiInterfaceService } from '@oscc/services/api/api-interface.service';
import { AuthService } from '@oscc/auth/auth.service';
import { CommentaryService } from '@oscc/commentary/commentary.service';
import { FragmentsApiService } from '@oscc/services/api/fragments.service';
import { PlaygroundApiService } from '@oscc/services/api/playground.service';
import { UtilityService } from '@oscc/utility.service';
import { FabricService } from './services/fabric.service';

import { FormatterService } from './services/formatter.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { DialogService } from '@oscc/services/dialog.service';
import { Playground } from '@oscc/models/Playground';
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
      this.playground.delete_selected();
    } else if ((event.ctrlKey || event.metaKey) && event.key == 'Z') {
      // Redo the canvas on Ctrl+Shift+Z
      this.playground.redo();
    } else if ((event.ctrlKey || event.metaKey) && event.key == 'z') {
      // Undo the canvas on Ctrl+Z
      this.playground.undo();
    }
  }
  // Listener for window resize evenets
  @HostListener('window:resize', ['$event'])
  onResize() {
    // If we resize the window, we want the canvas to resize as well
    this.playground.resize();
  }

  // TODO: remove. For the quickfilter
  protected _author: string;
  protected _title: string;
  protected _editor: string;
  protected _name: string;

  // Playground column that keeps all data related to said playground
  protected playground: Playground;

  private canvas_change_subscription: Subscription;
  private canvas_object_identifier: number = 0;

  constructor(
    private api_interface: ApiInterfaceService,
    private commentary: CommentaryService,
    private fabric: FabricService,
    private formatter: FormatterService,
    private mat_dialog: MatDialog,
    protected api: ApiService,
    private playground_api: PlaygroundApiService,
    protected auth_service: AuthService,
    protected fragments_api: FragmentsApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    private websockets: WebsocketsService
  ) {}

  ngOnInit(): void {
    this.init_playground();
    this.request_documents('fragments', { title: 'Eumenides' });
    //this.request_documents('testimonia', { author: 'Accius' });
  }

  ngOnDestroy() {
    if (this.canvas_change_subscription) {
      this.canvas_change_subscription.unsubscribe();
    }
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
            this.request_documents(result.document_type, filter);
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
  protected request_documents(document_type: string, filter: object): void {
    this.api_interface.get_documents(document_type, filter).subscribe((documents) => {
      // Format documents
      documents.forEach((doc: any) => {
        this.formatter.format(doc);
      });
      // Place the documents on the canvas
      this.playground.add(documents);
    });
  }

  /**
   * @author CptVickers
   */
  protected open_clear_playground(): void {
    this.dialog.open_confirmation_dialog('Are you sure you want to clear the playground?', '').subscribe({
      next: (res) => {
        if (res) {
          this.playground.clear();
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
          this.playground_api
            .load(
              new Playground_communicator({ _id: requested_playground_id, user: this.auth_service.current_user_name })
            )
            .subscribe((playground) => {
              this.process_incoming_playground(playground);
              this.utility.open_snackbar(`Playground ${this.playground.name} opened.`);
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
        if (data.button == 'save') {
          if (this.playground.role == 'owner' || this.playground.role == 'collaborator') {
            this.playground_api.save(
              new Playground_communicator({
                name: data.name,
                canvas: this.playground.canvas.toJSON(),
                _id: this.playground._id,
              })
            );
          } else {
            this.utility.open_snackbar('Not enough permissions');
          }
        } else if (data.button == 'create') {
          this.playground_api
            .create(
              new Playground_communicator({
                name: data.name,
                canvas: this.playground.canvas.toJSON(),
                created_by: this.auth_service.current_user_name,
                users: [
                  new Playground_user({
                    name: this.auth_service.current_user_name,
                    role: 'owner',
                  }),
                ],
              })
            )
            .subscribe((playground) => {
              this.process_incoming_playground(playground);
              this.utility.open_snackbar(`Playground ${this.playground.name} created.`);
            });
        }
      }
    });
  }

  /**
   * Opens the join playground dialog.
   * @author Ycreak
   */
  protected join_playground(): void {
    // We simulate the websockets in this function
    this.websockets.active = true;
    //this.websockets.connect();
    this.websockets.sendMessage('Hello from Angular!');
    // First, generate a string and provide it to the user as being the share string
    const identifier: string = (Math.random() + 1).toString(36).substring(7);
    this.utility.open_snackbar(`The share code is: ${identifier}`);

    // Next, copy the playground canvas to the websockets service
    this.websockets.canvas = this.playground.canvas.toJSON();

    // Take a subscription to get notified by any changes to the canvas
    this.canvas_change_subscription = this.playground.canvas_changed$.subscribe((canvas) => {
      // Now every time we change anything in the playground, we update the websockets canvas
      this.websockets.propagate(this.playground.canvas.toJSON());
    });
  }

  /**
   * Opens the share playground dialog. If accepted, we share the current playground with the given users.
   * @author Ycreak
   */
  protected share_playground(): void {
    if (this.playground.name) {
      const dialogRef = this.mat_dialog.open(SharePlaygroundComponent, { data: { users: this.playground.users } });
      dialogRef.afterClosed().subscribe({
        next: (users: Playground_user[]) => {
          if (users) {
            this.playground.users = users;
            this.playground_api.save(
              new Playground_communicator({
                _id: this.playground._id,
                users: this.playground.users,
              })
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
    if (this.playground.name) {
      const dialogRef = this.mat_dialog.open(DeletePlaygroundComponent, {
        data: { name: this.playground.name },
      });
      dialogRef.afterClosed().subscribe({
        next: (name: any) => {
          if (name) {
            // Check if we have the correct rights to delete the playground
            if (this.playground.role === 'owner') {
              this.playground_api.remove(new Playground_communicator({ _id: this.playground._id }));
              // Reset the playground to a clean slate
              this.playground.clear();
              this.playground.role = undefined;
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
    const clicked_document = this.playground.canvas.getActiveObjects()[0];
    if (!this.playground.is_note(clicked_document)) {
      const full_document = this.utility.filter_array(this.playground.documents, clicked_document.identifier)[0];
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
    this.playground.name = playground.name;
    this.playground.created_by = playground.created_by;
    this.playground.role = playground.role;
    this.playground._id = playground._id;
    this.playground.users = playground.users;
    // Apply data to the canvas
    this.playground.canvas.clear();
    this.playground.canvas.loadFromJSON(
      playground.canvas,
      this.playground.canvas.renderAll.bind(this.playground.canvas)
    );
  }

  /**
   * Inits the playground object
   * @author Ycreak
   */
  private init_playground(): void {
    this.playground = new Playground(this.fabric);
    this.playground.canvas = new fabric.Canvas('playground_canvas');
    this.playground.set_event_handlers();
    this.playground.init();
  }
}
