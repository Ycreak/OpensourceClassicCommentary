import { Component, Input, OnChanges } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

// Model imports
import { Commentary } from '@oscc/models/Commentary';

// Service imports
import { ApiService } from '@oscc/api.service';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';
import { StringFormatterService } from '@oscc/services/string-formatter.service';
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss'],
})
export class CommentaryComponent implements OnChanges {
  @Input() document: any;
  @Input() translated: boolean;

  @Output() request_column = new EventEmitter<any>();

  protected commentary: Commentary;

  protected document_clicked = false;
  protected translation_orig_text_expanded = false;

  protected bibliography = '';

  protected no_linked_commentary_found: boolean;
  protected linked_commentary_retrieved = false;
  protected linked_commentaries: Commentary[];

  constructor(
    private string_formatter: StringFormatterService,
    protected utility: UtilityService,
    protected api: ApiService,
    protected dialog: DialogService,
    protected settings: SettingsService
  ) {}

  ngOnChanges() {
    this.commentary = this.document.commentary;

    this.no_linked_commentary_found = false;
    this.linked_commentary_retrieved = false;
    this.linked_commentaries = [];

    // On init, convert all custom HTML tags in the commentary fields
    this.commentary = this.process_commentary_content_fields(
      this.commentary,
      this.string_formatter.convert_custom_tag_to_html
    );
    this.commentary = this.process_bibliography(this.commentary);
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
          this.commentary = this.process_commentary_content_fields(
            this.commentary,
            this.string_formatter.convert_custom_tag_to_html
          );
          this.commentary = this.process_bibliography(this.commentary);
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
  public process_bibliography(commentary: Commentary): Commentary {
    this.commentary = this.process_commentary_content_fields(this.commentary, this.convert_bib_entry.bind(this));
    // The previous function created a temporary bibliography. We put this one
    // inside our commentary object and clean the temporary one.
    commentary.bibliography = this.bibliography;
    this.bibliography = '';
    return commentary;
  }

  /**
   * Converts all Zotero cite entries in a blob of text to proper citations
   * @param string of text blob with (possibly) Zotero entries
   * @param Bib[] containing all Zotero entries in our bibliopgraphy
   * @returns string with its Zotero entries converted
   * @author Ycreak
   */
  protected convert_bib_entry(given_string: string): string {
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
        const bib_item = this.api.bibliography.find((o) => o.key === bib_key);
        //Add the item to the bibliography for easy printing in an expansion panel
        this.bibliography += bib_item.citation;
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

  /**
   * Function to toggle the expansion state of the fragment translation/original text sections
   * The expansion state is stored as a variable in this component so that it persists between
   * DOM changes.
   * @author CptVickers
   */
  protected toggle_translation_orig_text_expanded(): void {
    this.translation_orig_text_expanded = !this.translation_orig_text_expanded;
  }
}
