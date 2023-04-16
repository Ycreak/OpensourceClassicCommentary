import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ColumnHandlerService } from '@oscc/services/column-handler.service';
import { ApiService } from '@oscc/api.service';

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
    this.playground = new Column({ column_id: '0', type: 'playground' });
    //this.api.request_authors();
  }

  ngAfterViewInit() {
    /** Handle what happens when new fragments arrive */
    this.fragments_subscription = this.api.new_fragments_alert.subscribe(() => {
      console.log('new fragments!'); //let fragments = this.api.fragments;
      if (this.single_fragment_requested) {
        this.playground.fragments.concat(this.api.fragments);
      } else {
        this.playground.fragments = this.api.fragments;
      }
    });
    this.fragment_names_subscription = this.api.new_fragment_names_alert.subscribe(() => {
      console.log('new fragment names!');
      this.playground.fragment_names = this.api.fragment_names;
    });
  }

  ngOnDestroy() {
    this.fragments_subscription.unsubscribe();
    this.fragment_names_subscription.unsubscribe();
  }

  protected request_fragments(temp: any) {}

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
  protected handle_fragment_click(fragment: Fragment, from_playground: boolean = false): void {
    // If we are currently dragging a fragment in the playground, we do not want the click even to fire.
    if (!this.playground_dragging) {
      //this.fragment_clicked = true;
      //this.current_fragment = fragment;

      //console.log('frag', this.current_fragment);

      // The next part handles the colouring of clicked and referenced fragments.
      // First, restore all fragments to their original black colour when a new fragment is clicked
      for (let index in this.column_handler.columns) {
        this.column_handler.columns[index] = this.column_handler.colour_fragments_black(
          this.column_handler.columns[index]
        );
      }
      //TODO: this.playground_handler.playground = this.column_handler.colour_fragments_black(
      //this.playground_handler.playground
      //);
      // Second, colour the clicked fragment
      fragment.colour = '#3F51B5';
      // Lastly, colour the linked fragments
      //this.colour_linked_fragments(fragment);
      // And scroll each column to the linked fragment if requested
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
      column.fragments.splice(object_index, 1);
    } else {
      // it is a note
      const object_index = column.note_array.findIndex((object) => {
        return object === column.clicked_note;
      });
      column.note_array.splice(object_index, 1);
    }
  }

  /**
   * @param column to which the fragment is to be added
   * @author Ycreak
   */
  public add_single_fragment(column: Column, fragment_name: string): void {
    this.single_fragment_requested = true;
    // format the fragment and push it to the list
    this.api
      .get_fragments(
        new Fragment({
          author: column.selected_fragment_author,
          title: column.selected_fragment_title,
          editor: column.selected_fragment_editor,
          name: fragment_name,
        })
      )
      .subscribe((fragments) => {
        let fragment_list = this.api.convert_fragment_json_to_typescript(fragments);
        //FIXME: this could be more elegant. But the idea is that we need to add HTML. However,
        // the function add_HTML_to_lines expects a list. This list always has one element.
        //TODO: let html_fragment_list = this.fragment_utilities.add_HTML_to_lines([fragment_list[0]]);
        //column.fragments.push(html_fragment_list[0]);
        column.fragments.push(fragment_list[0]);
      });
  }
}
