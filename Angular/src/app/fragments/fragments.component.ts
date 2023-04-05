// Library imports
import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Library used for interacting with the page
import { trigger, transition, style, animate } from '@angular/animations';
import { environment } from '@src/environments/environment';

// Component imports
import { LoginComponent } from '@oscc/login/login.component';

// Service imports
import { ApiService } from '@oscc/api.service';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';
import { WindowSizeWatcherService } from '@oscc/services/window-watcher.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';
import { ColumnHandlerService } from './services/column-handler.service';
import { PlaygroundHandlerService } from './services/playground-handler.service';
import { FragmentUtilitiesService } from './services/fragment-utilities.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Column } from '@oscc/models/Column';
import { Introductions } from '@oscc/models/Introductions';

@Component({
  selector: 'app-fragments',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' }))]),
    ]),
  ],
})
export class FragmentsComponent implements OnInit, AfterViewInit {
  // Toggle switches for the HTML columns/modes
  commentary_enabled: boolean = true;
  playground_enabled: boolean = false;

  // Data columns
  commentary_column: Column;

  current_fragment: Fragment; // Variable to store the clicked fragment and its data
  fragment_clicked: boolean = false; // Shows "click a fragment" banner at startup if nothing is yet selected

  private authors_subscription: any;
  private titles_subscription: any;
  private editors_subscription: any;
  private fragments_subscription: any;
  private fragment_names_subscription: any;

  private current_column_id: string = '1';

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected auth_service: AuthService,
    protected dialog: DialogService,
    protected settings: SettingsService,
    protected window_watcher: WindowSizeWatcherService,
    private matdialog: MatDialog,
    protected column_handler: ColumnHandlerService,
    protected playground_handler: PlaygroundHandlerService,
    protected fragment_utilities: FragmentUtilitiesService
  ) { }

  ngOnInit(): void {
    // Create the window watcher for mobile devices
    this.window_watcher.init(window.innerWidth);
    // Create an empty current_fragment variable to be filled whenever the user clicks a fragment
    this.current_fragment = new Fragment({});
    // Create a commentary column (deprecated -> can be replaced by simple linked_fragments list)
    this.commentary_column = new Column({ column_id: '255' });
    // Create the first column and push it to the columns list
    if (this.column_handler.columns.length < 1) {
      this.column_handler.columns.push(
        new Column({
          column_id: '1',
          selected_fragment_author: 'Ennius',
          selected_fragment_title: 'Thyestes',
          selected_fragment_editor: 'TRF',
        })
      );
    }
    // Request data for this first/default column
    let first_column: Column = this.column_handler.columns.find((i) => i.column_id === '1');
    this.request_fragments(first_column);
    this.api.request_authors(first_column);

    this.api.request_authors2();
    this.api.request_titles2('Ennius');
    this.api.request_editors2('Ennius', 'Thyestes');
    this.api.request_fragment_names2('Ennius', 'Thyestes', 'TRF');

    this.api.request_fragments('Ennius', 'Thyestes', 'TRF');


  }

  ngAfterViewInit() {
    // this.authors_subscription = this.api.new_authors_alert.subscribe(() => {
    //   console.log('authors', this.api.authors);
    // });

    // this.titles_subscription = this.api.new_titles_alert.subscribe(() => {
    //   console.log('titles', this.api.titles);
    // });

    // this.editors_subscription = this.api.new_editors_alert.subscribe(() => {
    //   console.log('editors', this.api.editors);
    // });

    // this.fragment_names_subscription = this.api.new_fragment_names_alert.subscribe(() => {
    //   console.log('fragment_names', this.api.fragment_names);
    // });

    /** Handle what happens when new fragments arrive */
    this.fragments_subscription = this.api.new_fragments_alert.subscribe(() => {
      let fragments = this.api.fragments;

      fragments = this.fragment_utilities.add_HTML_to_lines(fragments);
      fragments = fragments.sort(this.utility.sort_fragment_array_numerically);
      fragments = this.fragment_utilities.sort_fragments_on_status(fragments);

      const updated_column = this.column_handler.columns.find((x) => x.column_id == this.current_column_id);
      
      updated_column.fragments = this.api.fragments;
      console.log('columns', updated_column);

    });

  }

  ngOnDestroy() {
    this.window_watcher.subscription$.unsubscribe();
    this.authors_subscription.unsubscribe();
    this.titles_subscription.unsubscribe();
    this.editors_subscription.unsubscribe();
    this.fragment_names_subscription.unsubscribe();
    this.fragments_subscription.unsubscribe();

  }

  //   _____  ______ ____  _    _ ______  _____ _______ _____
  //  |  __ \|  ____/ __ \| |  | |  ____|/ ____|__   __/ ____|
  //  | |__) | |__ | |  | | |  | | |__  | (___    | | | (___
  //  |  _  /|  __|| |  | | |  | |  __|  \___ \   | |  \___ \
  //  | | \ \| |___| |__| | |__| | |____ ____) |  | |  ____) |
  //  |_|  \_\______\___\_\\____/|______|_____/   |_| |_____/
  /**
   * Requests the API function for fragments given the author, title and editor.
   * @param column: Column
   * @returns Object with fragments that are sorted numerically and on their status. Also
   *          adds an HTML formatted string to the object for easy printing. Note that the
   *          new data is added to the corresponding field in the provided parameter
   * @author Bors & Ycreak
   */
  private request_fragments(column: Column): void {
    this.utility.spinner_on();

    this.api
      .get_fragments(
        new Fragment({
          author: column.selected_fragment_author,
          title: column.selected_fragment_title,
          editor: column.selected_fragment_editor,
        })
      )
      .subscribe((data) => {
        //TODO: can this be done automatically within the API?
        let fragment_list = this.api.convert_fragment_json_to_typescript(data);
        // Format the data just how we want it
        fragment_list = this.fragment_utilities.add_HTML_to_lines(fragment_list);
        fragment_list = fragment_list.sort(this.utility.sort_fragment_array_numerically);
        fragment_list = this.fragment_utilities.sort_fragments_on_status(fragment_list);
        // Store the formatted data at the correct place
        if (column.type != 'playground') {
          column.fragments = fragment_list;
          // Store the original order of the fragments in the column object
          column.original_fragment_order = []; // Clear first
          for (let frag of fragment_list) {
            column.original_fragment_order.push(frag.name);
          }
          // Now check if the column already exists. If so, replace it with the new object.
          if (this.column_handler.columns.length > 0) {
            this.column_handler.columns[
              this.column_handler.columns.findIndex((i) => i.column_id === column.column_id)
            ] = column;
          }
        } else {
          // In the case of the playground, we want to add the new edition to our playground
          column.fragments = column.fragments.concat(fragment_list);
        }
        this.utility.spinner_off();
      });
  }

  /**
   * Function to handle what happens when an editor is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
  protected handle_editor_click(column): void {
    this.current_column_id = column.column_id;
    this.api.request_fragments(column.author, column.title, column.editor);
    column.edited = false;
    // If we are in the playground, we request fragment names. Else we request fragments.
    // if (column.type == 'playground') {
    //   this.fragment_utilities.request_fragment_names(column);
    // } else {
    //   this.request_fragments(column);
    // }
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
  private handle_fragment_click(fragment: Fragment, from_playground: boolean = false): void {
    // If we are currently dragging a fragment in the playground, we do not want the click even to fire.
    if (!this.playground_handler.playground_dragging) {
      this.fragment_utilities.fragment_clicked = true;
      this.current_fragment = fragment;

      // Reset the commentary column and its linked fragments
      this.commentary_column.linked_fragments_content = [];

      // Now retrieve all linked fragments to show their content in the commentary column
      for (let i in fragment.linked_fragments) {
        // Request the fragment
        this.api
          .get_fragments({
            author: fragment.linked_fragments[i].author,
            title: fragment.linked_fragments[i].title,
            editor: fragment.linked_fragments[i].editor,
            name: fragment.linked_fragments[i].name,
          })
          .subscribe((data) => {
            let fragment = this.api.convert_fragment_json_to_typescript(data);
            // and push it to the commentary column (only one fragment in the list, so push the first one)
            this.commentary_column.linked_fragments_content.push(fragment[0]);
            this.utility.spinner_off();
          });
      }

      // The next part handles the colouring of clicked and referenced fragments.
      // First, restore all fragments to their original black colour when a new fragment is clicked
      for (let index in this.column_handler.columns) {
        this.column_handler.columns[index] = this.column_handler.colour_fragments_black(
          this.column_handler.columns[index]
        );
      }
      this.playground_handler.playground = this.column_handler.colour_fragments_black(
        this.playground_handler.playground
      );
      // Second, colour the clicked fragment
      fragment.colour = '#3F51B5';
      // Lastly, colour the linked fragments
      this.colour_linked_fragments(fragment);
      // And scroll each column to the linked fragment if requested
      if (!from_playground && this.settings.fragments.auto_scroll_linked_fragments) {
        this.scroll_to_linked_fragments(fragment);
      }
    } else {
      // After a drag, make sure to set the dragging boolean on false again
      this.playground_handler.playground_dragging = false;
    }
  }

  /**
   * Given the fragment, this function checks whether its linked fragments appear in the
   * other opened columns. If so, the columns are scrolled to put the linked fragment in view
   * @param fragment object with the linked_fragments field to be examined
   * @author Ycreak
   */
  private scroll_to_linked_fragments(fragment: Fragment) {
    for (let i in fragment.linked_fragments) {
      let linked_fragment_id = fragment.linked_fragments[i].linked_fragment_id;
      // Now, for each fragment that is linked, try to find it in the other columns
      for (let j in this.column_handler.columns) {
        // in each column, take a look in the fragments array to find the linked fragment
        let corresponding_fragment = this.column_handler.columns[j].fragments.find((i) => i._id === linked_fragment_id);
        // move to this fragment if found
        if (corresponding_fragment) {
          // Scroll to the corresponding element in the found column
          const element = document.getElementById(corresponding_fragment._id);
          element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }

  /**
   * Given the current fragment, colour the linked fragments in the other columns
   * @param fragment of which the linked fragments should be coloured
   * @author Ycreak
   */
  private colour_linked_fragments(fragment: Fragment): void {
    // Loop through all fragments the linked fragments
    for (let i in fragment.linked_fragments) {
      let linked_fragment_id = fragment.linked_fragments[i].linked_fragment_id;
      // Now, for each fragment that is linked, try to find it in the other columns
      for (let j in this.column_handler.columns) {
        // in each column, take a look in the fragments array to find the linked fragment
        let corresponding_fragment = this.column_handler.columns[j].fragments.find((i) => i._id === linked_fragment_id);
        // colour it if found
        if (corresponding_fragment) corresponding_fragment.colour = '#FF4081';
      }
      // Do the same for the playground
      let corresponding_fragment = this.playground_handler.playground.fragments.find(
        (i) => i._id === linked_fragment_id
      );
      // colour it if found
      if (corresponding_fragment) corresponding_fragment.colour = '#FF4081';
    }
  }

  /**
   * Function to handle the login dialog
   * @author Ycreak
   */
  public login(): void {
    const dialogRef = this.matdialog.open(LoginComponent, {});
  }

  /**
   * Function to handle the settings dialog. Will save changes via the oscc_settings object
   * @author Ycreak
   */
  public open_settings(): void {
    this.dialog.open_settings_dialog(this.settings.fragments).subscribe((result) => {
      if (result) {
        this.settings.fragments.dragging_disabled = result['dragging_disabled'];
        this.settings.fragments.fragment_order_gradient = result['fragment_order_gradient'];
        this.settings.fragments.auto_scroll_linked_fragments = result['auto_scroll_linked_fragments'];
      }
    });
  }

  /**
   * Simple function to toggle the playground column
   * @author Ycreak
   */
  private toggle_playground(): void {
    this.playground_enabled = !this.playground_enabled;
  }

  /**
   * Simple function to toggle the commentary column
   * @author Ycreak
   */
  private toggle_commentary(): void {
    this.commentary_enabled = !this.commentary_enabled;
  }

  /**
   * This function opens the requested introduction in a dialog
   * @param requested_introduction string containing the requested introduction
   * @author Ycreak
   * @TODO: this should be moved to the server
   */
  private request_introduction(requested_introduction: string): void {
    let new_introduction = new Introductions();
    let my_introduction = new_introduction.dict[requested_introduction];
    this.dialog.open_custom_dialog(my_introduction);
  }
}
