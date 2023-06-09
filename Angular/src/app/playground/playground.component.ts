import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { ColumnHandlerService } from '@oscc/services/column-handler.service';
import { ApiService } from '@oscc/api.service';
import { environment } from '@src/environments/environment';

// Service imports
import { UtilityService } from '@oscc/utility.service';
import { SettingsService } from '@oscc/services/settings.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Column } from '@oscc/models/Column';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() fragment_clicked = new EventEmitter<Fragment>();

  // Playground column that keeps all data related to said playground
  playground: Column;
  // Boolean to keep track if we are dragging or clicking a fragment within the playground
  playground_dragging: boolean;

  note: any;

  // Subscription variables
  private fragments_subscription: any;
  private fragment_names_subscription: any;

  protected single_fragment_requested: boolean;

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected settings: SettingsService,
    protected column_handler: ColumnHandlerService
  ) {}

  ngOnInit(): void {
    this.playground = new Column({ column_id: environment.playground_id });
  }

  ngAfterViewInit() {
    /** Handle what happens when new fragments arrive */
    this.fragments_subscription = this.api.new_fragments_alert$.subscribe((column_id) => {
      if (column_id == environment.playground_id) {
        const fragments = this.api.fragments;
        for (const i in fragments){
          fragments[i].add_html_to_commentary();
        }
        if (this.single_fragment_requested) {
          this.playground.fragments.push(fragments[0]);
        } else {
          this.playground.fragments = fragments;
        }
      }
    });
    /** Handle what happens when new fragment names arrive */
    this.fragment_names_subscription = this.api.new_fragment_names_alert$.subscribe((column_id) => {
      if (column_id == environment.playground_id) {
        this.playground.fragment_names = this.api.fragment_names;
      }
    });
  }

  ngOnDestroy() {
    this.fragments_subscription.unsubscribe();
    this.fragment_names_subscription.unsubscribe();
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
  protected handle_fragment_click(fragment: Fragment): void {
    // If we are currently dragging a fragment in the playground, we do not want the click even to fire.
    if (!this.playground_dragging) {
      this.fragment_clicked.emit(fragment);
      // The next part handles the colouring of clicked and referenced fragments.
      // First, restore all fragments to their original black colour when a new fragment is clicked
      for (const index in this.column_handler.columns) {
        this.column_handler.columns[index] = this.column_handler.colour_fragments_black(
          this.column_handler.columns[index]
        );
      }
      //TODO:
      this.playground = this.column_handler.colour_fragments_black(this.playground);
      // Second, colour the clicked fragment
      fragment.colour = '#3F51B5';
      // Lastly, colour the linked fragments
      // this.colour_linked_fragments(fragment);
    } else {
      // After a drag, make sure to set the dragging boolean on false again
      this.playground_dragging = false;
    }
  }

  /**
   * This function allows the playground to delete notes and fragements
   * @param column column from which the deletion is to take place
   * @param item either a note or a fragment needs deletion
   * @author Ycreak
   */
  public delete_clicked_item_from_playground(column: Column, item: string): void {
    if (item == 'fragment') {
      const object_index = column.fragments.findIndex((object) => {
        return object._id === column.clicked_fragment._id;
      });
      if (object_index != -1) {
        column.fragments.splice(object_index, 1);
      }
    } else {
      // it is a note
      const object_index = column.note_array.findIndex((object) => {
        return object === column.clicked_note;
      });
      if (object_index != -1) {
        column.note_array.splice(object_index, 1);
      }
    }
  }

  /**
   * @param column to which the fragment is to be added
   * @author Ycreak
   */
  public add_single_fragment(column: Column, fragment_name: string): void {
    this.single_fragment_requested = true;
    // format the fragment and push it to the list
    this.api.request_fragments(column.column_id, column.author, column.title, column.editor, fragment_name);
  }
}
