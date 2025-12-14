/**
 * This component visualises the columns as specified in the columns service. Whenever changes happen to the list
 * variable in the columns service, this component visualises these changes.
 * @author Ycreak
 */

// Library imports
import { Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, ParamMap } from '@angular/router';

// Service imports
import { AuthService } from '@oscc/auth/auth.service';
import { BibliographyService } from '@oscc/services/bibliography.service';
import { ColumnsService } from '@oscc/columns/columns.service';
import { CommentaryService } from '@oscc/commentary/commentary.service';
import { DialogService } from '@oscc/services/dialog.service';
import { ApiService } from '@oscc/api.service';
import { SettingsService } from '@oscc/services/settings.service';
import { UtilityService } from '@oscc/utility.service';

// Component imports
import { DocumentFilterComponent } from '@oscc/filters/document-filter/document-filter.component';

// Model imports
import { Column } from '@oscc/models/Column';
import { Fragment } from '@oscc/models/Fragment';
import { Linked_fragment } from '@oscc/models/Linked_fragment';
import { IntroductionsComponent } from '@oscc/commentary/introductions/introductions.component';
import { SandboxService } from '@oscc/services/sandbox.service';
import { ContextComponent } from './context/context.component';
import { TestimoniaComponent } from './testimonia/testimonia.component';
import { FragmentComponent } from './fragment/fragment.component';
import { OnCopyDirective } from '../directives/on-copy.directive';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LatinTragicFragmentFilterComponent } from '../filters/latin-tragic-fragment-filter/latin-tragic-fragment-filter.component';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatToolbarModule,
    LatinTragicFragmentFilterComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    NgFor,
    MatCheckboxModule,
    FormsModule,
    NgIf,
    MatProgressBarModule,
    CdkScrollable,
    NgTemplateOutlet,
    CdkDropList,
    OnCopyDirective,
    CdkDrag,
    TestimoniaComponent,
    FragmentComponent,
    ContextComponent,
  ],
})
export class ColumnsComponent implements OnInit {
  // Variable to store the clicked fragment and its data. Used for the context menu
  public current_document: any;

  fragment_form = new FormGroup({
    columnName: new FormControl(''),
  });

  constructor(
    protected api: ApiService,
    protected auth_service: AuthService,
    protected columns: ColumnsService,
    protected commentary: CommentaryService,
    protected dialog: DialogService,
    protected settings: SettingsService,
    protected utility: UtilityService,
    private bib: BibliographyService,
    private matdialog: MatDialog,
    private route: ActivatedRoute,
    protected sandbox: SandboxService
  ) {}

  ngOnInit(): void {
    this.api.request_index().subscribe({});
    // Create an empty current_document variable to be filled whenever the user clicks a fragment
    this.current_document = new Fragment();

    // Receive query parameters
    let filter: any = {};
    const params: ParamMap = this.route.snapshot.queryParamMap;
    if (this.utility.is_empty_object(params['params'])) {
      // If no query parameters are found, load our default Ennius Thyestes TRF edition
      filter = { author: 'Ennius', title: 'Thyestes', editor: 'TRF' };
    } else {
      filter.author = params.get('author');
      filter.title = params.get('title');
      filter.editor = params.get('editor');
    }
    filter.document_type = 'fragment';
    // Create the first column and push it to the columns list
    if (this.columns.list.length < 1) {
      const column_id = this.columns.add();
      this.columns.request(filter, column_id);
      this.columns.find(column_id).column_name = `${filter.author}-${filter.title}-${filter.editor}`;
      this.columns.find(column_id).author = `${filter.author}`;
      this.columns.find(column_id).title = `${filter.title}`;
      this.columns.find(column_id).editor = `${filter.editor}`;
    }
  }

  /**
   * Opens a dialog to set a custom filter. If filter set, requests documents from server
   * @param number of column_id to load documents into
   * @author Ycreak
   */
  protected set_custom_filter(column_id: number): void {
    const dialogRef = this.matdialog.open(DocumentFilterComponent, {});
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result && result.filters.length) {
          //TODO: for now, we need to request every single document from the server.
          // New API update will allow us to request a list of filters
          result.filters.forEach((filter: any) => {
            this.columns.request(filter, column_id, true);
            // Also reset the 'edited/altered' status for these columns to false
            this.columns.set_edited_flag_false(column_id);
          });
        }
      },
    });
  }

  /**
   * Function to handle what happens when a document is selected in HTML.
   * @param document selected by the user
   * @param Column
   * @author Ycreak
   */
  protected handle_document_click(document: any, column: Column): void {
    // Request the commentary to show the clicked document
    this.commentary.request(document);
    // Set the current document and current column for the context menus
    this.current_document = document;
    this.columns.current = column;

    // The next part handles the colouring of clicked and referenced documents.
    // First, restore all documents to their original black colour when a new document is clicked
    this.columns.list.forEach((column: Column) => {
      this.columns.blacken(column);
    });
    // Second, colour the clicked document
    document.colour = '#3F51B5';
    // Lastly, colour the linked documents
    this.columns.colour_linked_fragments(document);
  }

  /**
   * Shows broader context of the selected fragment based on the text fields of its commentary.context.
   * @param given_document with possible broader context
   */
  protected show_broader_context(given_document: any): void {
    if (
      // First check if the given document has broader context.
      given_document.commentary.fields.context.length > 0 &&
      given_document.commentary.fields.context.some((item) => item.text && item.text.trim() !== '')
    ) {
      const column_id = this.columns.add();
      const column = this.columns.find(column_id);
      given_document.commentary.fields.context.forEach((context: any) => {
        if (context.text != '') {
          // Add a document type so the frontend will know how to handle this context
          context.document_type = 'context';
          column.documents.push(context);
        }
      });
    } else {
      this.utility.open_snackbar('No broader context found');
    }
  }

  /**
   * Retrieves linked fragments from server and shows them in a new column
   * @author Ycreak
   */
  protected show_linked_documents(given_document: any): void {
    if (given_document.linked_fragments.length > 0) {
      const column_id = this.columns.add();
      given_document.linked_fragments.forEach((linked_fragment: Linked_fragment) => {
        this.columns.request(linked_fragment, column_id, true);
        this.columns.find(column_id).column_name = `Linked ${column_id}`;
      });
    } else {
      this.utility.open_snackbar('No linked documents found');
    }
  }

  /**
   * Helper function to find and return the textual content of a given document object
   * @author CptVickers
   */
  protected copy_document_content(given_document: any): void {
    if (!window.getSelection().toString()) {
      // Check if the user isn't trying to copy some other text.
      let content = '';

      if (!given_document.fragments_translated) {
        // Parse the fragment lines into a single string
        const fragment_lines = given_document.lines;
        for (const line of fragment_lines) {
          content += line.line_number + ': ' + line.text + '\n';
        }
      } else {
        content = given_document.translation;
      }
      // Move the result to the user's clipboard
      navigator.clipboard.writeText(content);
      // Notify the user that the text has been copied
      this.utility.open_snackbar('Document copied!');
    }
  }

  /**
   * Simple function that generates a different background color
   * for each fragment in a fragment column.
   * This is to indicate the initial order of the documents.
   *
   * Each fragment gets a color chosen from a set color
   * brightness range, though two neighboring documents can
   * only have a set difference in brightness.
   * @param n_documents The total number of documents in the column
   * @param fragment_index The index of the current fragment
   * @returns: Color as HSL value (presented as string)
   * @author CptVickers
   */
  protected generate_document_gradient_background_color(n_documents: number, fragment_index: number) {
    if (this.settings.fragments.fragment_order_gradient == true) {
      const max_brightness = 100;
      const min_brightness = 80;
      const max_brightness_diff = 10;

      let brightness_step = (max_brightness - min_brightness) / n_documents;
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
   * Opens a bibliography dialog with all entries from the documents in the column.
   * @param documents (list)
   * @author Ycreak
   */
  protected show_column_bibliography(column: Column): void {
    const column_bib_keys: string[] = [];
    // If there are keys, show the bibliography
    column.documents.forEach((doc: any) => {
      doc.commentary.bib_keys.forEach((key: string) => {
        column_bib_keys.push(key);
      });
    });
    column.bibliography_keys = [...new Set(column_bib_keys)];

    if (column.bibliography_keys.length == 0) {
      // If no keys are found, print a snackbar with the message
      this.utility.open_snackbar('No bibliography available for this column.');
    } else {
      // Convert the bibliography keys into citations and sort them alphabetically
      const string_bibliography = this.bib.convert_keys_into_bibliography(column.bibliography_keys);
      this.dialog.open_column_bibliography(string_bibliography);
    }
  }

  /**
   * This function allows the user to display the translations of the fragments instead of the original text.
   * The Fragment Translation tab in the commentary section then becomes the 'original text' tab instead.
   * @param column (Column)
   * @author CptVickers
   */
  protected toggle_translation(column: Column): void {
    // The document components will listen for this change
    column.translated = !column.translated;
    // Also notify the commentary service that the original text should be shown instead of the translation
    this.commentary.translate();
  }

  /**
   * Function to get an appropriate label for the toggle translation button
   * @author CptVickers
   */
  protected translation_toggle_button_label(column: Column): string {
    if (column.translated) {
      return 'Show original text';
    } else {
      return 'Show translation';
    }
  }

  // ###### Context menus ######
  /**
   * Method called when user right clicks a column name.
   * Currently used for the rename column action.#3F51B5
   * @param event MouseEvent, used for preventing default right click action from browser
   * @param column The selected column
   * @author sajvanwijk
   */
  // we create an object that contains coordinates of this context menu
  columnNameContextMenuTopLeftPosition = { x: '0', y: '0' };
  // viewChild decorator gives access to child context menu in the DOM
  @ViewChild('columnNameContextMenu', { static: true }) columnNameContextMenu: MatMenuTrigger;
  @ViewChild('columnNameContextMenuWrapper', { static: true }) columnNameContextMenuWrapper: MatMenuTrigger;
  protected onRightClickColumnName(event: MouseEvent, column: Column) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();

    // we record the mouse position in our object (context menu will spawn here)
    this.columnNameContextMenuTopLeftPosition.x = event.clientX + 'px';
    this.columnNameContextMenuTopLeftPosition.y = event.clientY + 'px';

    // we pass to the menu the information about column
    this.columnNameContextMenu.menuData = { column };

    // also set this column as the currently selected column
    this.columns.current = column;

    // we open the menu
    this.columnNameContextMenuWrapper.openMenu();
  }

  /**
   * Method called when the user click with the right button
   * Used to open a context menu as described in this component's html
   * @param event MouseEvent, it contains the coordinates
   * @param document The selected fragment/document
   * @param column The column where the selected fragment/document is from
   * @author sajvanwijk
   */
  // we create an object that contains coordinates of this context menu
  fragmentContextMenuTopLeftPosition = { x: '0', y: '0' };
  // viewChild decorator gives access to child context menu in the DOM
  @ViewChild('fragmentContextMenu', { static: true }) fragmentContextMenu: MatMenuTrigger;
  @ViewChild('fragmentContextMenuWrapper', { static: true }) fragmentContextMenuWrapper: MatMenuTrigger;
  protected onRightClickFragment(event: MouseEvent, document: any, column: Column) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();

    // we record the mouse position in our object (context menu will spawn here)
    this.fragmentContextMenuTopLeftPosition.x = event.clientX + 'px';
    this.fragmentContextMenuTopLeftPosition.y = event.clientY + 'px';

    // we pass to the menu the information about our document and column
    this.fragmentContextMenu.menuData = { document, column };
    // we open the menu
    this.fragmentContextMenuWrapper.openMenu();
  }

  /**
   * Opens the introduction dialog. An introduction can be about either an author or a text.
   * @author Ycreak
   */
  protected show_introduction(filter: any): void {
    console.log('Fetching introduction for: ' + filter);
    this.matdialog.open(IntroductionsComponent, {
      data: filter,
    });
  }

  @ViewChildren('ColumnNameField') columnNameFields: QueryList<EditableColumnNameComponent>;
  protected trigger_column_name_edit_mode(column: Column): void {
    // First get the column to edit; this is the one that matches the id of the currently selected column.
    const column_to_edit = this.columnNameFields.toArray().filter((c) => c.column.column_id == column.column_id)[0];
    // Switch this column to edit mode
    column_to_edit.toEditMode();
  }

  protected updateField() {
    console.log('testUpdate');
  }
  /**
   * Given the fragment, this function checks whether its linked fragments appear in the
   * other opened columns. If so, the columns are scrolled to put the linked fragment in view
   * @param fragment object with the linked_fragments field to be examined
   * @author Ycreak
   */
  //private scroll_to_linked_fragments(document: Fragment) {
  //for (const i in document.linked_fragments) {
  //const linked_document_id = document.linked_fragments[i].linked_fragment_id;
  //// Now, for each document that is linked, try to find it in the other columns
  //for (const j in this.columns) {
  //// in each column, take a look in the documents array to find the linked document
  //const corresponding_document = this.columns[j].documents.find(
  //(i) => i._id === linked_document_id
  //);
  //// move to this document if found
  //if (corresponding_document) {
  //// Scroll to the corresponding element in the found column
  //const element = document.getElementById(corresponding_document._id);
  //element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  //}
  //}
  //}
  //}
}
