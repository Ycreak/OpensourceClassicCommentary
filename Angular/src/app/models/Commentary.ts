import { Bib } from '@oscc/models/Bib';
import { Context } from './Context';
import { Line } from './Line';

/** This class represents a fragment and all its data fields */
export class Commentary {
  translation: string;
  commentary: string;
  apparatus: string;
  reconstruction: string;
  differences: string;
  metrical_analysis: string;
  context: Context[];

  lines: Line[] = [];

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param fragment with JSON data received from the server
   * @author Ycreak
   */
  public set(fragment: any) {
    this.translation = 'translation' in fragment ? fragment['translation'] : '';
    this.commentary = 'commentary' in fragment ? fragment['commentary'] : '';
    this.apparatus = 'apparatus' in fragment ? fragment['apparatus'] : '';
    this.reconstruction = 'reconstruction' in fragment ? fragment['reconstruction'] : '';
    this.differences = 'differences' in fragment ? fragment['differences'] : '';
    this.metrical_analysis = 'metrical_analysis' in fragment ? fragment['metrical_analysis'] : '';
    this.context = 'context' in fragment ? fragment['context'] : [];
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
  public add_html(): void {
    for (const item in this.lines) {
      // Loop through all lines of current fragment
      let line_text = this.lines[item].text;
      line_text = this.convert_whitespace_encoding(line_text);
      // Now push the updated lines to the correct place
      const updated_lines = {
        line_number: this.lines[item].line_number,
        text: line_text,
      };
      this.lines[item] = updated_lines;
    }
    // replaces the summary tag with summary CSS class for each commentary field
    this.apparatus = this.convert_custom_tag_to_html(this.apparatus);
    this.differences = this.convert_custom_tag_to_html(this.differences);
    this.translation = this.convert_custom_tag_to_html(this.translation);
    this.commentary = this.convert_custom_tag_to_html(this.commentary);
    this.reconstruction = this.convert_custom_tag_to_html(this.reconstruction);
    this.metrical_analysis = this.convert_custom_tag_to_html(this.metrical_analysis);
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
  public convert_bib_entries(zotero: Bib[]): void {
    // TODO: needs to be reworked in the commentary rewrite
    this.differences = this.convert_bib_entry(this.differences, zotero);
    this.commentary = this.convert_bib_entry(this.commentary, zotero);
    this.apparatus = this.convert_bib_entry(this.apparatus, zotero);
    this.reconstruction = this.convert_bib_entry(this.reconstruction, zotero);
    this.translation = this.convert_bib_entry(this.translation, zotero);

    for( const i in this.context ) {
      this.context[i].text = this.convert_bib_entry(this.context[i].text, zotero);
    }
  }

  /**
   * Converts all Zotero cite entries in a blob of text to proper citations
   * @param string of text blob with (possibly) Zotero entries
   * @param Bib[] containing all Zotero entries in our bibliopgraphy
   * @returns string with its Zotero entries converted
   * @author Ycreak
   */
  private convert_bib_entry(given_string: string, zotero: Bib[]): string {
    if (given_string != '' && given_string != null) {
      let from_page = '';
      let to_page = '';
      let bib_key = '';
      let full_tag = '';
      let html = '';

      // Convert the bibliography items.
      // TODO: we should let zotero convert the fields into a nice string.
      const bib_regex = /\[bib-([\s\S]*?)\]/gm;
      const bib_entries = [...given_string.matchAll(bib_regex)];
      if (bib_entries?.length) {
        bib_entries.forEach((entry) => {
          full_tag = entry[0];
          const values = entry[1].split('-');
          bib_key = values[0];
          const bib_item = zotero.find((o) => o.key === bib_key);
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
      }
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
      console.log(matches);
      // Create a span with the number of indents we want. Character level.
      // matches[0] contains including fish hooks, matches[1] only number
      const replacement = '<span style="padding-left:' + matches[1] + 'ch;"></span>';
      string = string.replace(matches[0], replacement);
    }
    return string;
  }

  /**
   * Returns true if the given fragment has one of its content fields filled
   * @param fragment to be investigated for content
   * @returns boolean whether content is present
   * @author Ycreak
   */
  public has_content() {
    return (
      this.differences != ''
      || this.apparatus != ''
      || this.translation != ''
      || this.commentary != ''
      || this.reconstruction != ''
    )
  }
}

