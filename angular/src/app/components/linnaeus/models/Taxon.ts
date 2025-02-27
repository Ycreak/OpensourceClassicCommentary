import { Commentary } from '@oscc/models/Commentary';
import { Line } from '@oscc/models/Line';
import { Linked_fragment } from '@oscc/models/Linked_fragment';

/** This class represents a fragment and all its data fields */
export class Taxon {
  names = [];
  traits = [];
  media = [];
  literature = [];
  pages = [];
  parentage = [];
  id = '';
  nsr_id = '';

  presence = '';
  habitat = '';

  document_type = 'fragment';
  // Meta data
  _id = '';
  author = '';
  title = '';
  editor = '';
  status = '';
  // Commentary
  commentary: Commentary;
  // Content
  lines: Line[] = [];
  linked_fragments: Linked_fragment[] = [];
  // Keeps track whether we tranlated this fragment using the column translate functionality
  translated = false;

  lock = '';
  published = '';

  // designates the css color of the fragment header
  colour = 'black';

  constructor() {}

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param fragment with JSON data received from the server
   * @author Ycreak
   */
  public set(fragment: any) {
    this._id = '_id' in fragment ? fragment['_id'] : '';
    this.author = 'author' in fragment ? fragment['author'] : '';
    this.title = 'title' in fragment ? fragment['title'] : '';
    this.editor = 'editor' in fragment ? fragment['editor'] : '';
    this.status = 'status' in fragment ? fragment['status'] : '';
    this.lines = 'lines' in fragment ? fragment['lines'] : [];

    this.lock = 'lock' in fragment ? fragment['lock'] : '';
    this.published = '' in fragment ? fragment['published'] : '';

    this.commentary = new Commentary({});
    this.commentary.set(fragment);
  }
}
