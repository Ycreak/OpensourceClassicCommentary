/**
 * The commentary component handles the visualisation of the commentary. Any component can send a document to the
 * commentary service. This component has a listener for that document. If the document changes, we change the commentary
 * on screen. Additionally, we listen for a translation toggle, which means that this component shows the original
 * text in the commentary instead of the translation.
 * @author Ycreak
 */

import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// Model imports
import { Commentary } from '@oscc/models/Commentary';
import { Fragment } from '@oscc/models/Fragment';

// Components imports
import { IntroductionsComponent } from './introductions/introductions.component';

// Service imports
import { ApiService } from '@oscc/api.service';
import { BibliographyService } from '@oscc/services/bibliography.service';
import { CommentaryService } from './commentary.service';
import { ColumnsService } from '@oscc/columns/columns.service';
import { DialogService } from '@oscc/services/dialog.service';
import { StringFormatterService } from '@oscc/services/string-formatter.service';
import { UtilityService } from '@oscc/utility.service';

@Component({
  standalone: false,
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss'],
})
export class CommentaryComponent {
  // The document given to the commentary to show its commentary
  protected document: any;
  // Commentary from the given document
  protected commentary: Commentary;
  // If no document has been clicked, we show a custom message
  protected document_clicked = false;
  // Documents are not translated by default
  protected translated = false;
  // If no linked commentary has been found, we show a banner
  protected no_linked_commentary_found: boolean;
  // If no  linked commentary has been retrieved, we show a button with the option to
  protected linked_commentary_retrieved = false;
  // List to hold multiple retrieved linked commentaries
  protected linked_commentaries: Commentary[] = [];

  constructor(
    private bib: BibliographyService,
    private mat_dialog: MatDialog,
    private string_formatter: StringFormatterService,
    protected api: ApiService,
    protected columns: ColumnsService,
    protected commentary_service: CommentaryService,
    protected dialog: DialogService,
    protected utility: UtilityService
  ) {
    // Subscribe to the commentary service to listen for a translation toggle
    this.commentary_service.translated.subscribe(() => {
      this.translated = !this.translated;
    });
    // Subscribe to the commentary service to listen for new incoming documents
    this.commentary_service.doc.subscribe((doc) => {
      // The commentary service has received a new document. We process the incoming document here.
      this.document = doc;
      this.commentary = this.document.commentary;
      this.document_clicked = true;
      // Reset linked commentary status and lists
      this.no_linked_commentary_found = false;
      this.linked_commentary_retrieved = false;
      this.linked_commentaries = [];
      // Add additional formatting to the commentary
      this.commentary.do_on_fields(this.string_formatter.convert_custom_tag_to_html);
      // Create a bibliography for the document
      this.commentary.bibliography = this.create_bibliography(this.document);
      this.convert_bib_keys_in_commentary();
    });
  }

  /**
   * Retrieve linked commentary given the current document
   * @author Ycreak
   */
  protected retrieve_linked_commentary(): void {
    let concurrent_calls = 0;
    this.linked_commentary_retrieved = true;
    // If no linked fragments are found, we set a banner
    if (this.document.linked_fragments.length == 0) {
      this.no_linked_commentary_found = true;
    }
    this.document.linked_fragments.forEach((filter: any) => {
      concurrent_calls += 1;
      this.api.request_documents(filter).subscribe((documents) => {
        const found_document = documents[0];
        concurrent_calls -= 1;
        if (found_document.commentary.has_content()) {
          found_document.commentary.do_on_fields(this.string_formatter.convert_custom_tag_to_html);
          found_document.commentary.bibliography = this.create_bibliography(found_document);
          this.linked_commentaries.push(found_document);
        }
        // If linked fragments are found but have no commentary, we set the banner
        // Only set this banner on the last api call. Otherwise the banner might flash by
        if (concurrent_calls == 0) {
          this.no_linked_commentary_found = this.linked_commentaries.length == 0;
        }
      });
    });
  }

  /**
   * Converts bib references to proper html and builds the bibliography
   * @param string that needs bib entries handled
   * @returns Commentary with bib entries handled
   * @author Ycreak
   */
  private create_bibliography(doc: any): string {
    return this.bib.convert_keys_into_bibliography(this.bib.get_keys_from_commentary(doc.commentary));
  }

  /**
   * Requests the columns component for a column to visualise linked fragments
   * @param linked_fragment (Fragment)
   * @author Ycreak
   */
  protected request_linked_fragments(fragment: Fragment): void {
    const column_id = this.columns.add();
    this.columns.request(
      {
        document_type: fragment.document_type,
        author: fragment.author,
        title: fragment.title,
        editor: fragment.editor,
      },
      column_id
    );
    this.columns.find(column_id).column_name = `${fragment.author}-${fragment.title}-${fragment.editor}`;
  }

  /**
   * Opens the introduction dialog. An introduction can be about either an author or a text.
   * @author Ycreak
   */
  protected show_introduction(filter: any): void {
    this.mat_dialog.open(IntroductionsComponent, {
      data: filter,
    });
  }
  /**
   * Converts all bib keys in the commentary to plain text
   * @author Ycreak
   */
  private convert_bib_keys_in_commentary(): void {
    const commentary_fields_keys = Object.keys(this.commentary.fields);
    commentary_fields_keys.forEach((key: string) => {
      if (this.utility.is_string(this.commentary.fields[key])) {
        this.commentary.fields[key] = this.bib.convert_bib_keys_in_string(this.commentary.fields[key]);
      } else if (this.utility.is_array(this.commentary.fields[key])) {
        this.commentary.fields[key].forEach((obj: any) => {
          obj.text = this.bib.convert_bib_keys_in_string(obj.text);
        });
      } else {
        console.error('Unsupported type.');
      }
    });
  }
}
