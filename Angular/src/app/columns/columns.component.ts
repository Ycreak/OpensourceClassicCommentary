// Library imports
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
//import { environment } from '@src/environments/environment';

// Service imports
import { ApiService } from '@oscc/api.service';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';
import { UtilityService } from '@oscc/utility.service';
import { BibliographyHelperService } from '@oscc/services/bibliography-helper.service';
import { AuthService } from '@oscc/auth/auth.service';
import { ColumnHandlerService } from '@oscc/services/column-handler.service';
import { DocumentFilterComponent } from '@oscc/dialogs/document-filter/document-filter.component';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Linked_fragment } from '@oscc/models/Linked_fragment';
import { Column } from '@oscc/models/Column';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
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
export class ColumnsComponent implements OnInit, OnChanges {
  @Input() requested_column: any;
  @Output() clicked_document = new EventEmitter<any>();

  public current_document: any; // Variable to store the clicked fragment and its data
  public document_clicked = false; // Shows "click a fragment" banner at startup if nothing is yet selected
  protected current_column: Column;

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected auth_service: AuthService,
    protected dialog: DialogService,
    protected column_handler: ColumnHandlerService,
    protected settings: SettingsService,
    private bib_helper: BibliographyHelperService,
    private matdialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.api.request_authors_titles_editors_blob();
    //FIXME: maybe we should only request the bibliography on fragment click?
    //this.zotero.request_bibliography();
    // Create an empty current_document variable to be filled whenever the user clicks a fragment
    this.current_document = new Fragment({});
    // Create the first column and push it to the columns list
    if (this.column_handler.columns.length < 1) {
      this.column_handler.columns.push(
        new Column({
          column_id: 1,
          author: 'Ennius',
          title: 'Thyestes',
          editor: 'TRF',
        }),
      );
    }
    this.current_column = this.column_handler.columns[0];
    this.request_documents(1, { document_type: 'fragment', author: 'Ennius', title: 'Thyestes', editor: 'TRF' });
  }

  ngOnChanges() {
    // If a new column is requested, we will handle the request here
    if (this.requested_column) {
      const column_id = this.column_handler.add_new_column('fragment');
      const filter = {
        author: this.requested_column.author,
        title: this.requested_column.title,
        editor: this.requested_column.editor,
      };
      this.api.get_documents(filter).subscribe((documents) => {
        documents = this.format_incoming_documents(documents);
        this.column_handler.add_documents_to_column(column_id, documents);
      });
    }
  }

  /**
   * Formats incoming documents: adds html, sorts documents.
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   * @returns documents (object[]) nicely formatted
   * @author Ycreak
   */
  private format_incoming_documents(documents: any[]): any[] {
    for (const i in documents) {
      if (documents[i].document_type == 'fragment') {
        documents[i].add_html_to_lines();
      }
    }
    // Prepare the documents for publication
    documents = documents.sort(this.utility.sort_fragment_array_numerically);
    documents = this.sort_documents_on_status(documents);

    return documents;
  }

  /**
   * Request the API for documents: add them to the given column
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_documents(column_id: number, filter: object): void {
    this.api.get_documents(filter).subscribe((documents) => {
      documents = this.format_incoming_documents(documents);
      this.column_handler.add_documents_to_column(column_id, documents);
    });
  }

  /**
   * Opens a dialog to set a custom filter. If filter set, requests documents from server
   * @param number of column_id to load documents into
   * @author Ycreak
   */
  protected set_custom_filter(column_id: number): void {
    const dialogRef = this.matdialog.open(DocumentFilterComponent, {});
    dialogRef.afterClosed().subscribe({
      next: (document_filter) => {
        if (document_filter) {
          this.request_documents(column_id, document_filter);
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
  protected handle_document_click(document: Fragment, column: Column): void {
    //TODO: we need to emit a commentary object to the commentary
    document.translated = column.translated;
    this.clicked_document.emit(document);

    //this.document_clicked2.emit(document);
    this.document_clicked = true;
    this.current_document = document;

    // The next part handles the colouring of clicked and referenced documents.
    // First, restore all documents to their original black colour when a new document is clicked
    for (const index in this.column_handler.columns) {
      this.column_handler.columns[index] = this.column_handler.colour_documents_black(
        this.column_handler.columns[index],
      );
    }
    // Second, colour the clicked document
    document.colour = '#3F51B5';
    // Lastly, colour the linked documents
    this.column_handler.colour_linked_fragments(document);
    // And scroll each column to the linked document if requested
    //if (this.settings.fragments.auto_scroll_linked_fragments) {
    //this.scroll_to_linked_fragments(document);
    //}
  }

  /**
   * Retrieves linked fragments from server and shows them in a new column
   * @author Ycreak
   */
  protected show_linked_documents(given_document: any): void {
    if (given_document.linked_fragments.length > 0) {
      const column_id = this.column_handler.add_new_column('fragment');
      given_document.linked_fragments.forEach((linked_fragment: Linked_fragment) => {
        this.api.get_documents(linked_fragment).subscribe((documents) => {
          this.column_handler.add_documents_to_column(column_id, documents, true);
        });
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

  /**
   * Sorts the given object of documents on status. We want to display Certa, followed
   * by Incerta and Adespota.
   * @param documents
   * @returns documents in the order we want
   * @author Ycreak
   */
  public sort_documents_on_status(documents: any[]): any[] {
    const normal = this.utility.filter_object_on_key(documents, 'status', 'Certum');
    const incerta = this.utility.filter_object_on_key(documents, 'status', 'Incertum');
    const adesp = this.utility.filter_object_on_key(documents, 'status', 'Adesp.');
    // Put testimonia at the end
    const testimonia = this.utility.filter_object_on_key(documents, 'document_type', 'testimonium');
    // Concatenate in the order we want
    documents = normal.concat(incerta).concat(adesp).concat(testimonia);

    return documents;
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
    let string_bibliography = '';
    let bib_keys: string[] = [];

    column.documents.forEach((doc: any) => {
      bib_keys = bib_keys.concat(this.bib_helper.retrieve_bib_keys_from_commentary(doc.commentary));
    });
    bib_keys = [...new Set(bib_keys)];
    // If there are keys, show the bibliography
    if (bib_keys.length > 0) {
      bib_keys.forEach((key: string) => {
        string_bibliography += this.bib_helper.convert_bib_key_into_citation(key);
      });
      this.dialog.open_column_bibliography(string_bibliography);
    } else {
      // If no keys are found, print a snackbar with the message
      this.utility.open_snackbar('No bibliography available for this column.');
    }
  }

  /**
   * This function allows the user to display the translations of the fragments instead of the original text.
   * The Fragment Translation tab in the commentary section then becomes the 'original text' tab instead.
   * @author CptVickers
   */
  protected toggle_translation(column: Column): void {
    column.translated = !column.translated;
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

  /**
   * Method called when the user click with the right button
   * Used to open a context menu as described in this component's html
   * @param event MouseEvent, it contains the coordinates
   * @param item Our data contained in the row of the table
   * @author sajvanwijk
   */
  // we create an object that contains coordinates
  menuTopLeftPosition = { x: '0', y: '0' };

  // reference to the MatMenuTrigger in the DOM
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;

  protected onRightClick(event: MouseEvent, item: any) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();

    // we record the mouse position in our object
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // we open the menu
    // we pass to the menu the information about our object
    this.matMenuTrigger.menuData = { item: item };

    // we open the menu
    this.matMenuTrigger.openMenu();
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
