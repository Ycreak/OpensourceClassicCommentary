// Library imports
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
//import { environment } from '@src/environments/environment';

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
export class FragmentsComponent implements OnInit, OnDestroy {
  @Output() new_commentary = new EventEmitter<Fragment>();

  public current_fragment: Fragment; // Variable to store the clicked fragment and its data
  fragment_clicked = false; // Shows "click a fragment" banner at startup if nothing is yet selected

  // Subscription variables
  private fragments_subscription: any;

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

    /** Handle what happens when new fragments arrive */
    this.fragments_subscription = this.api.new_fragments_alert$.subscribe((column_id) => {
      let fragments: Fragment[] = this.api.fragments;
      for (const i in fragments) {
        fragments[i].add_html_to_commentary();
      }
      // A new list of fragments has arrived. Use the column identifier to find the corresponding column
      const column = this.column_handler.columns.find((x) => x.column_id == column_id);
      if (column) {
        // Prepare the fragments for publication
        fragments = fragments.sort(this.utility.sort_fragment_array_numerically);
        fragments = this.sort_fragments_on_status(fragments);

        column.fragments = fragments;

        // Store the original order of the fragment names in the column object
        column.original_fragment_order = []; // Clear first
        for (const fragment of fragments) {
          column.original_fragment_order.push(fragment.name);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.fragments_subscription) {
      this.fragments_subscription.unsubscribe();
    }
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @param Column
   * @author Ycreak
   */
  protected handle_fragment_click(fragment: Fragment, column: Column): void {
    //TODO: we need to emit a commentary object to the commentary
    fragment.fragments_translated = column.fragments_translated;
    this.new_commentary.emit(fragment);

    //this.fragment_clicked2.emit(fragment);
    this.fragment_clicked = true;
    this.current_fragment = fragment;

    // The next part handles the colouring of clicked and referenced fragments.
    // First, restore all fragments to their original black colour when a new fragment is clicked
    for (const index in this.column_handler.columns) {
      this.column_handler.columns[index] = this.column_handler.colour_fragments_black(
        this.column_handler.columns[index]
      );
    }
    // Second, colour the clicked fragment
    fragment.colour = '#3F51B5';
    // Lastly, colour the linked fragments
    this.column_handler.colour_linked_fragments(fragment);
    // And scroll each column to the linked fragment if requested
    if (this.settings.fragments.auto_scroll_linked_fragments) {
      this.scroll_to_linked_fragments(fragment);
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
  protected generate_fragment_gradient_background_color(n_fragments: number, fragment_index: number) {
    if (this.settings.fragments.fragment_order_gradient == true) {
      const max_brightness = 100;
      const min_brightness = 80;
      const max_brightness_diff = 10;

      let brightness_step = (max_brightness - min_brightness) / n_fragments;
      if (brightness_step > max_brightness_diff) {
        brightness_step = max_brightness_diff;
      }
      const calculated_brightness = max_brightness - brightness_step * fragment_index;

      return `HSL(0, 0%, ${calculated_brightness}%)`;
    } else {
      return 'transparent';
    }
  }

  /**
   * This function allows the user to display the translations of the fragments instead of the original text.
   * The Fragment Translation tab in the commentary section then becomes the 'original text' tab instead.
   * @author CptVickers
   */
  protected toggle_translation(column: Column): void {
    column.fragments_translated = !column.fragments_translated;
  }

  /**
   * Function to get an appropriate label for the toggle translation button
   * @author CptVickers
   */
  protected translation_toggle_button_label(column: Column): string {
    if (column.fragments_translated) {
      return 'Show original text';
    } else {
      return 'Show translation';
    }
  }
}
