import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ApiService } from '@oscc/api.service';
import { ZoteroService } from '@oscc/services/zotero.service';

// Model imports
import { Commentary } from '@oscc/models/Commentary';
import { DialogService } from '@oscc/services/dialog.service';
import { SettingsService } from '@oscc/services/settings.service';

// Service imports
import { UtilityService } from '@oscc/utility.service';

import { Bib } from '@oscc/models/Bib';

@Component({
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss'],
})
export class CommentaryComponent implements OnChanges {
  @Input() commentary: Commentary;
  @Input() translated: boolean;

  protected document_clicked = false;
  protected translation_orig_text_expanded = false;

  protected bibliography = '';

  constructor(
    private zotero: ZoteroService,
    protected utility: UtilityService,
    protected api: ApiService,
    protected dialog: DialogService,
    protected settings: SettingsService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.commentary) {
      this.commentary = this.add_html(this.commentary);
      //this.convert_bib_entries(this.commentary, this.zotero.bibliography);
    }
  }

  /**
   * This function adds HTML to the lines of the given array. At the moment,
   * it converts white space encoding for every applicable line by looping through
   * all elements in a fragment list.
   * @param array with fragments as retrieved from the server
   * @returns updated array with nice HTML formatting included
   * @author Ycreak
   * @TODO: this function needs to be handled by the API when retrieving the fragments
   */
  public add_html(commentary: Commentary): Commentary {
    for (const item in commentary.lines) {
      // Loop through all lines of current fragment
      let line_text = commentary.lines[item].text;
      line_text = this.convert_whitespace_encoding(line_text);
      // Now push the updated lines to the correct place
      const updated_lines = {
        line_number: commentary.lines[item].line_number,
        text: line_text,
      };
      commentary.lines[item] = updated_lines;
    }
    // replaces the summary tag with summary CSS class for each commentary field
    commentary.apparatus = this.convert_custom_tag_to_html(commentary.apparatus);
    commentary.differences = this.convert_custom_tag_to_html(commentary.differences);
    commentary.translation = this.convert_custom_tag_to_html(commentary.translation);
    commentary.commentary = this.convert_custom_tag_to_html(commentary.commentary);
    commentary.reconstruction = this.convert_custom_tag_to_html(commentary.reconstruction);
    commentary.metrical_analysis = this.convert_custom_tag_to_html(commentary.metrical_analysis);

    return commentary;
  }

  /**
   * Converts the custom tags in the given blob of text to html
   * @param string with text blob possibly containing custom tags
   * @returns string with the custom tags replaced with corresponding html
   * @author Ycreak
   */
  private convert_custom_tag_to_html(given_string: string): string {
    if (given_string != '' && given_string != null) {
      // Convert the summary tags
      given_string = given_string.replace(/\[summary\]([\s\S]*?)\[\/summary\]/gm, '<div class="summary">$1</div>');
    }
    return given_string;
  }

  /**
   * Converts bib references to proper html
   * @param string that needs bib entries handled
   * @returns string with bib entries handled
   * @author Ycreak
   */
  public convert_bib_entries(commentary: Commentary, zotero: Bib[]): void {
    // TODO: needs to be reworked in the commentary rewrite
    //commentary.differences = this.convert_bib_entry(commentary.differences, zotero);
    //commentary.commentary = this.convert_bib_entry(commentary.commentary, zotero);
    //commentary.apparatus = this.convert_bib_entry(commentary.apparatus, zotero);
    //commentary.reconstruction = this.convert_bib_entry(commentary.reconstruction, zotero);
    //commentary.translation = this.convert_bib_entry(commentary.translation, zotero);
    //for (const i in commentary.context) {
    //commentary.context[i].text = this.convert_bib_entry(commentary.context[i].text, zotero);
    //}
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
        this.zotero.get_zotero_item(bib_key).subscribe((bib_item) => {
          //Add the item to the bibliography for easy printing in an expansion panel
          this.bibliography += `<p>${bib_item.citation}</p>`;
          if (values.length > 2) {
            from_page = values[1];
            to_page = values[2];
            html = `(${bib_item.creators[0].lastname}, ${bib_item.date}: ${from_page}-${to_page})`;
          } else if (values.length > 1) {
            from_page = values[1];
            html = `(${bib_item.creators[0].lastname}, ${bib_item.date}: ${from_page})`;
          } else {
            html = `(${bib_item.creators[0].lastname}, ${bib_item.date})`;
          }
          given_string = given_string.replace(full_tag, html);
        });
      });
    }
    return given_string;
  }

  /**
   * Takes a string and looks for whitespace decoding. Converts it to html spans
   * @param string that needs whitespaces converted to html spans
   * @returns string with whitespaces converted to html spans
   * @author Ycreak
   */
  private convert_whitespace_encoding(string: string): string {
    // Find fish hooks with number in between.
    const matches = string.match(/<(\d+)>/);
    // If found, replace it with the correct whitespace number
    if (matches) {
      // Create a span with the number of indents we want. Character level.
      // matches[0] contains including fish hooks, matches[1] only number
      const replacement = '<span style="padding-left:' + matches[1] + 'ch;"></span>';
      string = string.replace(matches[0], replacement);
    }
    return string;
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
