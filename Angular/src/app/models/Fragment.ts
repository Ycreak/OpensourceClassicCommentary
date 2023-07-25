import { Commentary } from './Commentary';
import { Line } from './Line';
import { Linked_fragment } from './Linked_fragment';

/** This class represents a fragment and all its data fields */
export class Fragment {
  // Meta data
  _id = '';
  author = '';
  title = '';
  editor = '';
  name = '';
  status = '';
  // Commentary
  commentary: Commentary;
  // Content
  lines: Line[] = [];
  linked_fragments: Linked_fragment[] = [];
  // Keeps track whether we tranlated this fragment using the column translate functionality
  fragments_translated = false;

  lock = '';
  published = '';

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
    this.commentary = new Commentary({});
    this.commentary.set(fragment);

    this._id = '_id' in fragment ? fragment['_id'] : '';
    this.author = 'author' in fragment ? fragment['author'] : '';
    this.title = 'title' in fragment ? fragment['title'] : '';
    this.editor = 'editor' in fragment ? fragment['editor'] : '';
    this.name = 'name' in fragment ? fragment['name'] : '';
    this.status = 'status' in fragment ? fragment['status'] : '';
    this.lines = 'lines' in fragment ? fragment['lines'] : [];
    this.linked_fragments = 'linked_fragments' in fragment ? fragment['linked_fragments'] : [];
    this.lock = 'lock' in fragment ? fragment['lock'] : '';
    this.published = '' in fragment ? fragment['published'] : '';
  }

  /**
   * This function adds HTML to the lines of the given array. At the moment,
   * it converts white space encoding for every applicable line by looping through
   * all elements in a fragment list.
   * @param array with fragments as retrieved from the server
   * @returns updated array with nice HTML formatting included
   * @author Ycreak
   */
  public add_html_to_lines(): void {
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
}
