/**
 * The commentary component handles the visualisation of the commentary. Any component can send a document to the
 * commentary service. This component has a listener for that document. If the document changes, we change the commentary
 * on screen. Additionally, we listen for a translation toggle, which means that this component shows the original
 * text in the commentary instead of the translation.
 * @author Ycreak
 */

import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// Model imports
import { Commentary } from '@oscc/types/Commentary';
import { Fragment } from '@oscc/types/Fragment';

// Components imports
import { IntroductionsComponent } from './components/introductions/introductions.component';

// Service imports
import { ApiService } from '@oscc/services/api.service';
import { BibliographyService } from '@oscc/services/bibliography.service';
import { CommentaryService } from './services/commentary.service';
import { ColumnsService } from '@oscc/features/columns/services/columns.service';
import { DialogService } from '@oscc/services/dialog.service';
import { StringFormatterService } from '@oscc/services/string-formatter.service';
import { UtilityService } from '@oscc/services/utility.service';
import { ExpandableTextComponent } from '@oscc/components/expandable-text/expandable-text.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { GeneralCommentaryFieldComponent } from './components/general-commentary-field/general-commentary-field.component';
import { TranslationComponent } from './components/translation/translation.component';
import { MatButtonModule } from '@angular/material/button';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss'],
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    TranslationComponent,
    GeneralCommentaryFieldComponent,
    MatExpansionModule,
    ExpandableTextComponent,
  ],
})
export class CommentaryComponent {
  private bib = inject(BibliographyService);
  private mat_dialog = inject(MatDialog);
  private string_formatter = inject(StringFormatterService);
  protected api = inject(ApiService);
  protected columns = inject(ColumnsService);
  protected commentary_service = inject(CommentaryService);
  protected dialog = inject(DialogService);
  protected utility = inject(UtilityService);

  // The document given to the commentary to show its commentary
  protected document: any;
  // Commentary from the given document
  protected commentary: Commentary;
  // If no document has been clicked, we show a custom message
  protected document_clicked = signal(false);
  // Documents are not translated by default
  protected translated = signal(false);
  // If no linked commentary has been found, we show a banner
  protected no_linked_commentary_found = signal(false);
  // If no  linked commentary has been retrieved, we show a button with the option to
  protected linked_commentary_retrieved = signal(false);
  // List to hold multiple retrieved linked commentaries. A signal so the view
  // repaints when the api responses arrive (the app runs without zone.js).
  protected linked_commentaries = signal<Commentary[]>([]);

  constructor() {
    // Subscribe to the commentary service to listen for a translation toggle
    this.commentary_service.translated.subscribe(() => {
      this.translated.update((translated) => !translated);
    });
    // Subscribe to the commentary service to listen for new incoming documents
    this.commentary_service.doc.subscribe((doc) => {
      // The commentary service has received a new document. We process the incoming document here.
      this.document = doc;
      this.commentary = this.document.commentary;
      this.document_clicked.set(true);
      // Reset linked commentary status and lists
      this.no_linked_commentary_found.set(false);
      this.linked_commentary_retrieved.set(false);
      this.linked_commentaries.set([]);
      // Add additional formatting to the commentary
      this.commentary.do_on_fields(this.string_formatter.convert_custom_tag_to_html);
      // Construct the bibliography if we did not do that already for the click document.
      if (this.commentary.bibliography === '') {
        this.commentary.bibliography = this.create_bibliography(this.document);
        this.convert_bib_keys_in_commentary();
      }
    });
  }

  /**
   * Retrieve linked commentary given the current document
   */
  protected retrieve_linked_commentary(): void {
    let concurrent_calls = 0;
    this.linked_commentary_retrieved.set(true);
    // If no linked fragments are found, we set a banner
    if (this.document.linked_fragments.length == 0) {
      this.no_linked_commentary_found.set(true);
    }
    this.document.linked_fragments.forEach((linked_fragment: any) => {
      concurrent_calls += 1;
      // Only send the fields the server can filter a fragment on
      const { author, title, editor, name } = linked_fragment;
      this.api.request_documents({ document_type: 'fragment', author, title, editor, name }).subscribe((documents) => {
        const found_document = documents[0];
        concurrent_calls -= 1;
        if (found_document.commentary.has_content()) {
          found_document.commentary.do_on_fields(this.string_formatter.convert_custom_tag_to_html);
          found_document.commentary.bibliography = this.create_bibliography(found_document);
          this.linked_commentaries.update((commentaries) => [...commentaries, found_document]);
        }
        // If linked fragments are found but have no commentary, we set the banner
        // Only set this banner on the last api call. Otherwise the banner might flash by
        if (concurrent_calls == 0) {
          this.no_linked_commentary_found.set(this.linked_commentaries().length == 0);
        }
      });
    });
  }

  /**
   * Converts bib references to proper html and builds the bibliography
   * @param string that needs bib entries handled
   * @returns Commentary with bib entries handled
   */
  private create_bibliography(doc: any): string {
    return this.bib.convert_keys_into_bibliography(doc.commentary.bib_keys);
  }

  /**
   * Requests the columns component for a column to visualise linked fragments
   * @param linked_fragment (Fragment)
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
   */
  protected show_introduction(filter: any): void {
    this.mat_dialog.open(IntroductionsComponent, {
      data: filter,
    });
  }
  /**
   * Converts all bib keys in the commentary to plain text
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
        console.error(`Unsupported type: ${key}`);
      }
    });
  }
}
