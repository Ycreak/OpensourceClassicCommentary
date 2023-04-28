// Library imports
import { Component, OnInit, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
//import { MatDialog } from '@angular/material/dialog'; // Library used for interacting with the page
import { trigger, transition, style, animate } from '@angular/animations';
//import { environment } from '@src/environments/environment';

// Component imports
//import { LoginComponent } from '@oscc/login/login.component';

// Service imports
import { ApiService } from '@oscc/api.service';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';
import { ColumnHandlerService } from '@oscc/services/column-handler.service';

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
export class FragmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  //@Input() commentary_enabled!: boolean;
  @Output() fragment_clicked2 = new EventEmitter<Fragment>();

  public current_fragment: Fragment; // Variable to store the clicked fragment and its data
  fragment_clicked = false; // Shows "click a fragment" banner at startup if nothing is yet selected

  // Subscription variables
  private fragments_subscription: any;

  private playground_dragging = false; //TODO

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected auth_service: AuthService,
    protected dialog: DialogService,
    protected settings: SettingsService,
    //private matdialog: MatDialog,
    protected column_handler: ColumnHandlerService
  ) {}

  ngOnInit(): void {
    this.api.request_authors_titles_editors_blob();
    // Create an empty current_fragment variable to be filled whenever the user clicks a fragment
    this.current_fragment = new Fragment({});
    // Create a commentary column (deprecated -> can be replaced by simple linked_fragments list)
    //this.commentary_column = new Column({ column_id: '255' });
    // Create the first column and push it to the columns list
    if (this.column_handler.columns.length < 1) {
      this.column_handler.columns.push(
        new Column({
          column_id: 1,
          author: 'Ennius',
          title: 'Thyestes',
          editor: 'TRF',
        })
      );
    }
    this.api.request_fragments(1, 'Ennius', 'Thyestes', 'TRF');
    //this.request_introduction(this.commentary_column);
  }

  ngAfterViewInit() {
    /** Handle what happens when new fragments arrive */
    this.fragments_subscription = this.api.new_fragments_alert.subscribe((column_id) => {
      let fragments = this.api.fragments;
      console.log(fragments);
      // A new list of fragments has arrived. Use the column identifier to find the corresponding column
      const column = this.column_handler.columns.find((x) => x.column_id == column_id);
      if (column) {
        // Prepare the fragments for publication
        fragments = this.add_HTML_to_lines(fragments);
        fragments = fragments.sort(this.utility.sort_fragment_array_numerically);
        fragments = this.sort_fragments_on_status(fragments);

        column.fragments = fragments;
      }
    });
  }

  ngOnDestroy() {
    this.fragments_subscription.unsubscribe();
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
  protected handle_fragment_click(fragment: Fragment): void {
    this.fragment_clicked2.emit(fragment);
    // If we are currently dragging a fragment in the playground, we do not want the click even to fire.
    if (!this.playground_dragging) {
      this.fragment_clicked = true;
      this.current_fragment = fragment;

      // Reset the commentary column and its linked fragments
      //this.commentary_column.linked_fragments_content = [];

      // Now retrieve all linked fragments to show their content in the commentary column
      //for (let i in fragment.linked_fragments) {
      //// Request the fragment
      //this.api
      //.get_fragments({
      //author: fragment.linked_fragments[i].author,
      //title: fragment.linked_fragments[i].title,
      //editor: fragment.linked_fragments[i].editor,
      //name: fragment.linked_fragments[i].name,
      //})
      //.subscribe((data) => {
      //let fragment = this.api.convert_fragment_json_to_typescript(data);
      //// and push it to the commentary column (only one fragment in the list, so push the first one)
      ////this.commentary_column.linked_fragments_content.push(fragment[0]);
      //this.utility.spinner_off();
      //});
      //}

      // The next part handles the colouring of clicked and referenced fragments.
      // First, restore all fragments to their original black colour when a new fragment is clicked
      for (const index in this.column_handler.columns) {
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
      this.colour_linked_fragments(fragment);
      // And scroll each column to the linked fragment if requested
      if (this.settings.fragments.auto_scroll_linked_fragments) {
        this.scroll_to_linked_fragments(fragment);
      }
    } else {
      // After a drag, make sure to set the dragging boolean on false again
      this.playground_dragging = false;
    }
  }

  /**
   * Given the fragment, this function checks whether its linked fragments appear in the
   * other opened columns. If so, the columns are scrolled to put the linked fragment in view
   * @param fragment object with the linked_fragments field to be examined
   * @author Ycreak
   */
  private scroll_to_linked_fragments(fragment: Fragment) {
    for (const i in fragment.linked_fragments) {
      const linked_fragment_id = fragment.linked_fragments[i].linked_fragment_id;
      // Now, for each fragment that is linked, try to find it in the other columns
      for (const j in this.column_handler.columns) {
        // in each column, take a look in the fragments array to find the linked fragment
        const corresponding_fragment = this.column_handler.columns[j].fragments.find(
          (i) => i._id === linked_fragment_id
        );
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
    for (const i in fragment.linked_fragments) {
      const linked_fragment_id = fragment.linked_fragments[i].linked_fragment_id;
      // Now, for each fragment that is linked, try to find it in the other columns
      for (const j in this.column_handler.columns) {
        // in each column, take a look in the fragments array to find the linked fragment
        const corresponding_fragment = this.column_handler.columns[j].fragments.find(
          (i) => i._id === linked_fragment_id
        );
        // colour it if found
        if (corresponding_fragment) corresponding_fragment.colour = '#FF4081';
      }
      // Do the same for the playground TODO:
      //const corresponding_fragment = this.playground_handler.playground.fragments.find(
      //(i) => i._id === linked_fragment_id
      //);
      // colour it if found
      //if (corresponding_fragment) corresponding_fragment.colour = '#FF4081';
    }
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
   * This function opens the requested introduction in a dialog
   * @param requested_introduction string containing the requested introduction
   * @author Ycreak
   * @TODO: this should be moved to the server
   */
  private request_introduction(requested_introduction: string): void {
    const new_introduction = new Introductions();
    const my_introduction = new_introduction.dict[requested_introduction];
    this.dialog.open_custom_dialog(my_introduction);
  }

  /**
   * This function adds HTML to the lines of the given array. At the moment,
   * it converts white space encoding for every applicable line by looping through
   * all elements in a fragment list.
   * @param array with fragments as retrieved from the server
   * @returns updated array with nice HTML formatting included
   * @author Ycreak
   */
  public add_HTML_to_lines(array: Fragment[]): Fragment[] {
    // For each element in the given array
    for (const fragment in array) {
      // Loop through all fragments
      const current_fragment = array[fragment];
      for (const item in current_fragment.lines) {
        // Loop through all lines of current fragment
        let line_text = current_fragment.lines[item].text;
        line_text = this.utility.convert_whitespace_encoding(line_text);
        // Now push the updated lines to the correct place
        const updated_lines = {
          line_number: current_fragment.lines[item].line_number,
          text: line_text,
        };
        current_fragment.lines[item] = updated_lines;
      }
    }
    return array;
  }

  /**
   * Sorts the given object of fragments on status. We want to display Certa, followed
   * by Incerta and Adespota.
   * @param fragments
   * @returns fragments in the order we want
   * @author Ycreak
   */
  public sort_fragments_on_status(fragments: Fragment[]): Fragment[] {
    const normal = this.utility.filter_object_on_key(fragments, 'status', 'Certum');
    const incerta = this.utility.filter_object_on_key(fragments, 'status', 'Incertum');
    const adesp = this.utility.filter_object_on_key(fragments, 'status', 'Adesp.');
    // Concatenate in the order we want
    fragments = normal.concat(incerta).concat(adesp);
    return fragments;
  }

  /**
   * Simple function that generates a different background color
   * for each fragment in a fragment column.
   * This is to indicate the initial order of the fragments.
   *
   * Each fragment gets a color chosen from a set color
   * brightness range, though two neighboring fragments can
   * only have a set difference in brightness.
   * @param n_fragments The total number of fragments in the column
   * @param fragment_index The index of the current fragment
   * @returns: Color as HSL value (presented as string)
   * @author CptVickers
   */
  private generate_fragment_gradient_background_color(n_fragments: number, fragment_index: number) {
    // console.log(this.oscc_settings.fragment_order_gradient);
    if (this.settings.fragments.fragment_order_gradient == true) {
      const max_brightness = 100;
      const min_brightness = 80;
      const max_brightness_diff = 10;

      let brightness_step = (max_brightness - min_brightness) / n_fragments;
      if (brightness_step > max_brightness_diff) {
        brightness_step = max_brightness_diff;
      }
      const calculated_brightness = min_brightness + brightness_step * fragment_index;

      return `HSL(0, 0%, ${calculated_brightness}%)`;
    } else {
      return 'transparent';
    }
  }
}
