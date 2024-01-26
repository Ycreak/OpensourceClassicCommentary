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

  protected translated = false;
  protected translation_expanded = false;

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
    protected columns: ColumnsService,
    protected commentary_service: CommentaryService,
    protected utility: UtilityService,
    protected api: ApiService,
    protected dialog: DialogService
  ) {
    this.commentary_service.translated.subscribe((translated) => {
      this.translated = translated;
    });
    this.commentary_service.doc.subscribe((doc) => {
      // The commentary service has received a new document. We process the incoming document here.
      this.document_clicked = true;
      this.document = doc;

      this.commentary = this.document.commentary;
      // Reset linked commentary status and lists
      this.no_linked_commentary_found = false;
      this.linked_commentary_retrieved = false;
      this.linked_commentaries = [];
      // Add additional formatting to the commentary
      this.commentary = this.process_commentary_content_fields(
        this.commentary,
        this.string_formatter.convert_custom_tag_to_html
      );
      // Create a bibliography for the document
      this.commentary.bibliography = this.create_bibliography(this.document);
      this.process_bibliography(this.commentary);
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
      this.api.get_documents(filter).subscribe((documents) => {
        const found_document = documents[0];
        concurrent_calls -= 1;
        if (found_document.commentary.has_content()) {
          found_document.commentary = this.process_commentary_content_fields(
            found_document.commentary,
            this.string_formatter.convert_custom_tag_to_html
          );
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
   * Loops over all content fields of the commentary and applies the provided function to them.
   * @param commentary (Commentary)
   * @param given_function (function)
   * @return Commentary
   * @author Ycreak
   */
  private process_commentary_content_fields(commentary: Commentary, given_function: (arg: string) => string) {
    const commentary_fields_keys = Object.keys(commentary.fields);
    commentary_fields_keys.forEach((key: string) => {
      if (this.utility.is_string(commentary.fields[key])) {
        commentary.fields[key] = given_function(commentary.fields[key]);
      } else if (this.utility.is_array(commentary.fields[key])) {
        commentary.fields[key].forEach((obj: any) => {
          obj.text = given_function(obj.text);
        });
      } else {
        console.error('Unsupported type.');
      }
    });
    return commentary;
  }

  /**
   * Converts bib references to proper html and builds the bibliography
   * @param string that needs bib entries handled
   * @returns Commentary with bib entries handled
   * @author Ycreak
   */
  private create_bibliography(doc: any): string {
    return this.bib.convert_keys_into_bibliography(doc.bib_keys);
  }

  /**
   * Function to toggle the expansion state of the fragment translation/original text sections
   * The expansion state is stored as a variable in this component so that it persists between
   * DOM changes.
   * @author CptVickers
   */
  protected toggle_translation_expanded(): void {
    this.translation_expanded = !this.translation_expanded;
  }

  /**
   * Requests the columns component for a column to visualise linked fragments
   * @param linked_fragment (Fragment)
   * @author Ycreak
   */
  protected request_linked_fragments(fragment: Fragment): void {
    const column_id = this.columns.add();
    this.columns.request({ author: fragment.author, title: fragment.title, editor: fragment.editor }, column_id);
    this.columns.find(column_id).column_name = `${fragment.author}-${fragment.title}-${fragment.editor}`;
  }

  /**
   * Opens the introduction dialog. An introduction can be about either an author or a text.
   * @author Ycreak
   */
  protected show_introduction(author: string, title?: string): void {
    title = title ? title : '';
    //FIXME: enable when introductions are working.
    const enabled = false;
    if (enabled) {
      this.mat_dialog.open(IntroductionsComponent, {
        data: { author: author, title: title },
      });
    }
  }

  /**
   * Converts bib references to proper html and builds the bibliography
   * @param string that needs bib entries handled
   * @returns Commentary with bib entries handled
   * @author Ycreak
   */
  public process_bibliography(commentary: Commentary) {
    commentary.do_on_fields(this.convert_bib_keys_in_string.bind(this));
  }

  /**
   * Converts all Zotero cite entries in a string to proper citations
   * @param string of text blob with (possibly) Zotero entries
   * @returns string with its Zotero entries converted to (author, year: from-to)
   * @author Ycreak
   */
  public convert_bib_keys_in_string(given_string: string): string {
    let from_page = '';
    let to_page = '';
    let bib_key = '';
    let full_tag = '';
    let html = '';

    // Convert the bibliography items.
    const bib_regex = /\[bib-([\s\S]*?)\]/gm;
    const bib_entries = [...given_string.matchAll(bib_regex)];
    if (bib_entries?.length) {
      bib_entries.forEach((entry) => {
        full_tag = entry[0];
        const values = entry[1].split('-');
        bib_key = values[0];
        const bib_item = this.bib.bibliography.find((o) => o.key === bib_key);
        // The key looks as follows: [bib-<key>-<lastname>-<date>-<from_page>-<to_page>]
        if (values.length > 4) {
          from_page = values[3];
          to_page = values[4];
          html = `(${bib_item.creators[0].lastname}, ${bib_item.date}: ${from_page}-${to_page})`;
        } else if (values.length > 3) {
          from_page = values[3];
          html = `(${bib_item.creators[0].lastname}, ${bib_item.date}: ${from_page})`;
        } else {
          html = `(${bib_item.creators[0].lastname}, ${bib_item.date})`;
        }
        given_string = given_string.replace(full_tag, html);
      });
    }
    return given_string;
  }
}
