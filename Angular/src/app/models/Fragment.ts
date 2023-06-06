import { Context } from './Context';
import { Line } from './Line';
import { Linked_fragment } from './Linked_fragment';

/** This class represents a fragment and all its data fields */
export class Fragment {
  _id = '';
  author = '';
  title = '';
  editor = '';
  name = '';

  translation: string;
  commentary: string;
  apparatus: string;
  reconstruction: string;
  differences: string;
  metrical_analysis: string;
  context: Context[];

  status = '';
  lines: Line[] = [];
  linked_fragments: Linked_fragment[] = [];

  lock = '';
  published = '';

  bibliography: string[];

  // designates the css color of the fragment header
  colour = 'black';

  constructor(fragment?: Partial<Fragment>) {
    // Allow the partial initialisation of a fragment object
    Object.assign(this, fragment);
  }

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param fragment with JSON data received from the server
   * @author Ycreak
   */
  public set_fragment(fragment: any) {
    this.translation = 'translation' in fragment ? fragment['translation'] : '';
    this.commentary = 'commentary' in fragment ? fragment['commentary'] : '';
    this.apparatus = 'apparatus' in fragment ? fragment['apparatus'] : '';
    this.reconstruction = 'reconstruction' in fragment ? fragment['reconstruction'] : '';
    this.differences = 'differences' in fragment ? fragment['differences'] : '';
    this.metrical_analysis = 'metrical_analysis' in fragment ? fragment['metrical_analysis'] : '';
    this.context = 'context' in fragment ? fragment['context'] : [];

    if ('_id' in fragment) {
      this._id = fragment['_id'];
    }
    if ('author' in fragment) {
      this.author = fragment['author'];
    }
    if ('title' in fragment) {
      this.title = fragment['title'];
    }
    if ('editor' in fragment) {
      this.editor = fragment['editor'];
    }
    if ('name' in fragment) {
      this.name = fragment['name'];
    }
    if ('status' in fragment) {
      this.status = fragment['status'];
    }
    if ('lines' in fragment) {
      this.lines = fragment['lines'];
    }
    if ('linked_fragments' in fragment) {
      this.linked_fragments = fragment['linked_fragments'];
    }
    if ('lock' in fragment) {
      this.lock = fragment['lock'];
    }
    if ('published' in fragment) {
      this.published = fragment['published'];
    }
    if ('bibliography' in fragment) {
      this.bibliography = fragment['bibliography'];
    }

    this.add_html_to_commentary();
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
  private add_html_to_commentary(): void {
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
    this.apparatus = this.convert_summary_tag_to_html(this.apparatus);
    this.differences = this.convert_summary_tag_to_html(this.differences);
    this.translation = this.convert_summary_tag_to_html(this.translation);
    this.commentary = this.convert_summary_tag_to_html(this.commentary);
    this.reconstruction = this.convert_summary_tag_to_html(this.reconstruction);
    this.metrical_analysis = this.convert_summary_tag_to_html(this.metrical_analysis);
  }

  /**
   * Converts the summary tag in the given blob of text to html
   * @param string with text blob possibly containing the summary tag
   * @returns string with the summary tag replaced with corresponding html
   * @author Ycreak
   */
  private convert_summary_tag_to_html(given_string: string): string {
    if (given_string != '' && given_string != null) {
      return given_string.replace(/\[summary\]([\s\S]*?)\[\/summary\]/gm, '<div class="summary">$1</div>');
    } else {
      return given_string;
    }
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
    if (
      this.differences != '' ||
      this.apparatus != '' ||
      this.translation != '' ||
      this.commentary != '' ||
      this.reconstruction != ''
    ) {
      return true;
    } else {
      return false;
    }
  }

  // deprecated
  fragment_link_found = false;
}
