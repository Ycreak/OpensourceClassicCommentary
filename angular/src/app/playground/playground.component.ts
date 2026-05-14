/* The playground component holds all logic regarding the playground, including the fabricjs canvas,
 * the save and open buttons and all other components that are part of the playground. These components
 * are found inside this folder, but are not in this file. This component should just be the host to all
 * these individual components. Additionally, it holds information about the currently loaded playground,
 * like its name and its users. The canvas is fully handled by the fabric service.
 */
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { WebsocketsService } from '@oscc/playground/websockets.service';
import { HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import * as fabric from 'fabric';
import { Subscription, forkJoin } from 'rxjs';

// Service imports
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { ColumnsService } from '@oscc/columns/columns.service';
import { CommentaryService } from '@oscc/commentary/commentary.service';
import { UtilityService } from '@oscc/utility.service';
import { FabricService } from './services/fabric.service';
import { WindowSizeWatcherService } from '@oscc/services/window-watcher.service';
import { LessonService } from './teaching/lesson.service';

import { FormatterService } from './services/formatter.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { DialogService } from '@oscc/services/dialog.service';
import { Playground_communicator } from '@oscc/models/api/Playground_communicator';
import { Lesson } from './teaching/lesson.model';

// Component imports
import { LoadPlaygroundComponent } from './load-playground/load-playground.component';
import { SavePlaygroundComponent } from './save-playground/save-playground.component';
import { DeletePlaygroundComponent } from './delete-playground/delete-playground.component';
import { SharePlaygroundComponent } from './share-playground/share-playground.component';
import { JoinPlaygroundComponent } from './join-playground/join-playground.component';
import { DocumentFilterComponent } from '@oscc/filters/document-filter/document-filter.component';
import { Playground_user } from '@oscc/models/api/Playground_user';
import { LatinTragicFragmentFilterComponent } from '../filters/latin-tragic-fragment-filter/latin-tragic-fragment-filter.component';
import { StartLessonComponent } from './teaching/start-lesson/start-lesson.component';
import { LessonSummaryComponent } from './teaching/lesson-summary/lesson-summary.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgStyle } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
  standalone: true,
  imports: [NgIf, NgStyle, MatProgressBarModule, MatIconModule, LatinTragicFragmentFilterComponent, MatMenuModule, MatButtonModule],
})
export class PlaygroundComponent implements OnInit, OnDestroy {
  @Output() document_clicked = new EventEmitter<Fragment>();
  @Output() commentary_requested = new EventEmitter<void>();
  // Listener for key events
  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete' && !this.lesson_mode) {
      this.fabric.delete_selected();
    } else if ((event.ctrlKey || event.metaKey) && event.key == 'Z') {
      this.fabric.redo();
    } else if ((event.ctrlKey || event.metaKey) && event.key == 'z') {
      this.fabric.undo();
    }
  }
  // Listener for window resize evenets
  @HostListener('window:resize')
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
  private lesson_double_click_handler: (event: any) => void;
  private native_lesson_double_click_handler: (event: MouseEvent) => void;
  private last_lesson_double_click_time = 0;
  private selected_lesson_document: any = null;
  protected lesson_commentary_button_visible = false;
  protected lesson_commentary_button_style: { left: string; top: string } = { left: '0px', top: '0px' };

  // Lesson-mode state
  protected lesson_mode = false;
  protected current_lesson: Lesson | null = null;
  protected current_step_index = 0;
  protected step_scores: { correct: number; total: number; misplaced: number }[] = [];
  protected step_checked = false;
  private lesson_documents: any[] = [];

  constructor(
    protected api: ApiService,
    protected auth_service: AuthService,
    protected columns: ColumnsService,
    protected dialog: DialogService,
    protected fabric: FabricService,
    protected utility: UtilityService,
    protected websockets: WebsocketsService,
    private commentary: CommentaryService,
    private formatter: FormatterService,
    private lesson_service: LessonService,
    private mat_dialog: MatDialog,
    private ng_zone: NgZone,
    protected window_watcher: WindowSizeWatcherService
  ) {}

  ngOnInit(): void {
    this.init_playground();
    //this.request_documents({ document_type: 'fragment', author: 'Karel' });

    // Create the window watcher for checking viewport size
    this.window_watcher.init(window.innerWidth);
  }

  ngOnDestroy() {
    if (this.canvas_change_subscription) {
      this.canvas_change_subscription.unsubscribe();
    }
    if (this.lesson_double_click_handler && this.fabric.canvas) {
      this.fabric.canvas.off('mouse:dblclick' as any, this.lesson_double_click_handler);
    }
    if (this.native_lesson_double_click_handler && this.fabric.canvas?.upperCanvasEl) {
      this.fabric.canvas.upperCanvasEl.removeEventListener('dblclick', this.native_lesson_double_click_handler);
    }
    // Close the websocket
    this.disconnect_from_websocket();

    if (this.window_watcher.subscription$) {
      this.window_watcher.subscription$.unsubscribe();
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
    //this.websockets_subscription = this.websockets.get_messages().subscribe((message) => {
    //this.fabric.canvas.loadFromJSON(message, this.fabric.canvas.renderAll.bind(this.fabric.canvas));
    //});
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
    this.request_commentary_for_canvas_object(clicked_document);
  }

  /**
   * Sends the currently selected lesson fragment to the commentary column.
   */
  protected request_selected_lesson_commentary(): void {
    const selected_document = this.selected_lesson_document ?? this.fabric.canvas.getActiveObjects()[0];
    this.request_commentary_for_canvas_object(selected_document);
  }

  /**
   * Requests commentary for a specific canvas object.
   * @param clicked_document Fabric object representing a document.
   */
  private request_commentary_for_canvas_object(clicked_document: any): void {
    clicked_document = this.resolve_document_canvas_object(clicked_document);
    if (!clicked_document) {
      this.utility.open_snackbar('Commentary not found.');
      return;
    }

    if (!this.fabric.is_note(clicked_document)) {
      const full_document = this.utility.filter_array(this.fabric.documents, (clicked_document as any).identifier)[0];
      if (full_document) {
        const selected_column_document = this.columns.select_document(full_document);
        this.commentary.request(selected_column_document?.document ?? full_document, { highlight: true });
        this.commentary_requested.emit();
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
    this.set_lesson_commentary_event_handlers();
    this.fabric.init();
  }

  /**
   * Allows students to inspect checked lesson fragments by double-clicking them.
   * Single-click still selects fragments on the canvas; double-click sends the
   * matching full document back to the regular commentary column.
   */
  private set_lesson_commentary_event_handlers(): void {
    this.lesson_double_click_handler = (event: any) => {
      this.handle_lesson_double_click(event);
    };
    this.native_lesson_double_click_handler = (event: MouseEvent) => {
      this.handle_lesson_double_click({ e: event });
    };

    this.fabric.canvas.upperCanvasEl.addEventListener('dblclick', this.native_lesson_double_click_handler);
    this.fabric.canvas.on('mouse:dblclick' as any, this.lesson_double_click_handler);
    this.fabric.canvas.on('selection:created' as any, () => this.update_selected_lesson_document());
    this.fabric.canvas.on('selection:updated' as any, () => this.update_selected_lesson_document());
    this.fabric.canvas.on('selection:cleared' as any, () => {
      this.ng_zone.run(() => {
        this.selected_lesson_document = null;
        this.lesson_commentary_button_visible = false;
      });
    });
    this.fabric.canvas.on('object:moving' as any, () => this.update_lesson_commentary_button_position());
    this.fabric.canvas.on('object:modified' as any, () => this.update_lesson_commentary_button_position());
    this.fabric.canvas.on('after:render' as any, () => this.update_lesson_commentary_button_position());
  }

  private handle_lesson_double_click(event: any): void {
    if (!this.lesson_mode || !this.step_checked) return;

    const now = Date.now();
    if (now - this.last_lesson_double_click_time < 100) return;
    this.last_lesson_double_click_time = now;

    const target = this.get_lesson_double_click_target(event);
    if (!target) return;
    this.selected_lesson_document = target;
    this.request_commentary_for_canvas_object(target);
  }

  /**
   * Stores the selected lesson document so an HTML button can request commentary
   * even when Fabric selection events do not trigger Angular template updates.
   */
  private update_selected_lesson_document(): void {
    this.ng_zone.run(() => {
      if (!this.lesson_mode || !this.step_checked) return;
      this.selected_lesson_document = this.resolve_document_canvas_object(this.fabric.canvas.getActiveObjects()[0]);
      this.update_lesson_commentary_button_position();
    });
  }

  /**
   * Positions the small commentary button near the selected lesson fragment.
   */
  private update_lesson_commentary_button_position(): void {
    if (!this.lesson_mode || !this.step_checked || !this.selected_lesson_document) {
      this.lesson_commentary_button_visible = false;
      return;
    }

    const rect = this.selected_lesson_document.getBoundingRect();
    const viewport_transform = this.fabric.canvas.viewportTransform;
    const top_right = fabric.util.transformPoint(new fabric.Point(rect.left + rect.width, rect.top), viewport_transform);
    const canvas_width = this.fabric.canvas.width ?? window.innerWidth;

    this.lesson_commentary_button_style = {
      left: `${Math.min(Math.max(top_right.x - 16, 8), canvas_width - 56)}px`,
      top: `${Math.max(top_right.y - 44, 8)}px`,
    };
    this.lesson_commentary_button_visible = true;
  }

  /**
   * Fabric can report a double-click target as the group, a child object, an
   * active selection, or no direct target depending on the current selection.
   * Normalize those cases back to the document group that carries `identifier`.
   */
  private get_lesson_double_click_target(event: any): any {
    const pointer_target = event?.e ? this.fabric.canvas.findTarget(event.e) : null;
    const candidates = [
      event?.target,
      event?.currentTarget,
      pointer_target,
      ...(event?.subTargets ?? []),
      ...(this.fabric.canvas.getActiveObjects() ?? []),
    ];

    for (const candidate of candidates) {
      const document_object = this.resolve_document_canvas_object(candidate);
      if (document_object) return document_object;
    }

    return null;
  }

  /**
   * Walks from a Fabric object, child object, or active selection to a document group.
   */
  private resolve_document_canvas_object(candidate: any): any {
    if (!candidate) return null;

    if (this.fabric.is_document(candidate)) {
      return candidate;
    }

    const child_objects = candidate.getObjects ? candidate.getObjects() : candidate._objects;
    if (child_objects?.length) {
      for (const child of child_objects) {
        const document_object = this.resolve_document_canvas_object(child);
        if (document_object) return document_object;
      }
    }

    if (candidate.group) {
      return this.resolve_document_canvas_object(candidate.group);
    }

    if (candidate.parent) {
      return this.resolve_document_canvas_object(candidate.parent);
    }

    return null;
  }

  /**
   * Opens the lesson picker. On selection, loads the lesson JSON, requests its fragments,
   * scatters them, captures the initial canvas state, and enters the first step.
   */
  protected start_lesson(): void {
    const dialogRef = this.mat_dialog.open(StartLessonComponent, { data: {} });
    dialogRef.afterClosed().subscribe({
      next: (lesson_id: string | null) => {
        if (!lesson_id) return;
        this.lesson_service.load_lesson(lesson_id).subscribe({
          next: (lesson: Lesson) => {
            this.current_lesson = lesson;
            this.lesson_mode = true;
            this.current_step_index = 0;
            this.step_scores = [];
            this.step_checked = false;
            this.fabric.clear_zones();
            this.fabric.clear_feedback();
            this.fabric.clear();
            this.load_lesson_fragments(lesson);
          },
        });
      },
    });
  }

  /**
   * For each fragment-pool in the lesson, fetches all matching fragments from the API and
   * randomly samples the configured count. Caches the sampled documents and enters step 0,
   * which rebuilds the canvas from scratch with the step's zone centered in the viewport.
   */
  private load_lesson_fragments(lesson: Lesson): void {
    if (lesson.fragment_pools.length === 0) {
      this.utility.open_snackbar('Lesson has no fragment pools.');
      this.exit_lesson();
      return;
    }
    const calls = lesson.fragment_pools.map((pool) =>
      this.api.request_documents({ ...pool.criterion, document_type: 'fragment', visible: 1 })
    );
    forkJoin(calls).subscribe({
      next: (results: any[]) => {
        const all_docs: any[] = [];
        results.forEach((docs: any[], i: number) => {
          if (!docs || docs.length === 0) return;
          const pool = lesson.fragment_pools[i];
          const shuffled = [...docs].sort(() => Math.random() - 0.5);
          const sampled = shuffled.slice(0, pool.count);
          sampled.forEach((doc) => {
            this.formatter.format(doc);
            all_docs.push(doc);
          });
        });
        if (all_docs.length === 0) {
          this.utility.open_snackbar('No matching fragments returned by the server.');
          this.exit_lesson();
          return;
        }
        this.lesson_documents = all_docs;
        this.enter_step(0);
      },
    });
  }

  /**
   * Rebuilds the canvas from scratch for the given step: clears everything, re-adds the
   * cached lesson documents, adds the step's zone (centered in viewport), then scatters
   * the fragments around the zone within the visible viewport.
   */
  private enter_step(i: number): void {
    if (!this.current_lesson) return;
    this.step_checked = false;
    this.fabric.clear_zones();
    this.fabric.clear_feedback();
    this.fabric.clear();
    this.fabric.add(this.lesson_documents);
    const zones = this.current_lesson.steps[i].zones;
    this.fabric.add_zones(zones);
    this.fabric.scatter_around_zones(zones);
  }

  /**
   * Evaluates the current step, paints per-fragment feedback, and records the step score.
   * The score counts only target fragments (those that belong in a zone): correct = number
   * of target fragments placed in their expected zone; total = number of target fragments.
   * Distractor fragments dropped into a zone are tracked separately as `misplaced`.
   */
  protected check_step(): void {
    if (!this.current_lesson) return;
    const step = this.current_lesson.steps[this.current_step_index];
    const results = this.fabric.evaluate_step(step.zones);
    this.fabric.apply_feedback(results);
    const target_results = results.filter((r) => r.should_zone_label !== null);
    const correct = target_results.filter((r) => r.is_correct).length;
    const misplaced = results.filter(
      (r) => r.should_zone_label === null && r.placed_zone_label !== null
    ).length;
    this.step_scores[this.current_step_index] = { correct, total: target_results.length, misplaced };
    this.step_checked = true;
  }

  /**
   * Advances to the next step (which rebuilds the canvas with the new zone),
   * or ends the lesson if the last step is complete.
   */
  protected next_step(): void {
    if (!this.current_lesson) return;
    if (this.current_step_index + 1 < this.current_lesson.steps.length) {
      this.current_step_index++;
      this.enter_step(this.current_step_index);
    } else {
      this.end_lesson();
    }
  }

  /**
   * Opens the summary dialog at lesson completion. On close, either restarts the picker
   * or exits lesson mode entirely.
   */
  private end_lesson(): void {
    if (!this.current_lesson) return;
    const dialogRef = this.mat_dialog.open(LessonSummaryComponent, {
      data: {
        lesson_title: this.current_lesson.title,
        step_scores: this.step_scores,
      },
    });
    dialogRef.afterClosed().subscribe({
      next: (action: string) => {
        this.exit_lesson();
        if (action === 'restart_list') {
          this.start_lesson();
        }
      },
    });
  }

  /**
   * Tears down lesson state and restores the playground to free-play mode.
   */
  protected exit_lesson(): void {
    this.lesson_mode = false;
    this.current_lesson = null;
    this.current_step_index = 0;
    this.step_scores = [];
    this.step_checked = false;
    this.lesson_documents = [];
    this.selected_lesson_document = null;
    this.lesson_commentary_button_visible = false;
    this.fabric.clear_zones();
    this.fabric.clear_feedback();
    this.fabric.clear();
  }

  /**
   * Returns the prompt text for the current step, or an empty string if no lesson is active.
   */
  protected get current_prompt(): string {
    if (!this.current_lesson) return '';
    return this.current_lesson.steps[this.current_step_index]?.prompt ?? '';
  }

  /**
   * Returns the total number of steps in the current lesson, or 0 if none.
   */
  protected get total_steps(): number {
    return this.current_lesson?.steps.length ?? 0;
  }

  /**
   * Returns the explanation text for the current step (if authored), or an empty string.
   */
  protected get current_explanation(): string {
    if (!this.current_lesson) return '';
    return this.current_lesson.steps[this.current_step_index]?.explanation ?? '';
  }

  /**
   * Returns the current step's score (correct/total/misplaced), or null if not yet checked.
   */
  protected get current_step_score(): { correct: number; total: number; misplaced: number } | null {
    return this.step_scores[this.current_step_index] ?? null;
  }

  /**
   * Shows the help menu for the playground
   * @author sajvanwijk
   */
  protected show_helpmenu(helpmenuoption: string): void {
    let helptext;
    if (helpmenuoption == 'a') {
      helptext = `<div><b>This is the playground</b><br><br>
      This is a place to take fragments and move them around in a freeform way, as to gain new insights. 
      It is also possible to add notes where you can place your thoughts.
      <br><br>
      You can also add other users to your playground in order to collaborate together! This way you will
      both be able to work on the same fragments and to share insights and connections.
      </div>`;
    }
    if (helpmenuoption == 'b') {
      helptext = `<div>
      FIXME See how we can best add icons/images here for additional clarity.<br><br>

      <b>Loading fragments</b><br>
      Lorem ipsum dolor sit amet 
      <br><br>
      <b>Drawing on the playground</b><br><br>
      <b>Undo/Redo</b><br><br>
      <b>Saving your playground</b><br><br>
      <b>Loading a saved playground</b><br><br>
      <b>Sharing a playground session</b><br><br>
      <b>Joining a playground session</b><br><br>
      </div>`;
    }
    this.dialog.open_custom_dialog(helptext);
  }
}
