import { Fragment } from './Fragment';
/**
 * This class represents a Fragment column, which contains meta data about a column. Most
 * important within a column is the Fragments object, which is a list containing fragments.
 * This class is also used to pass to api request functions as a pass by reference object.
 * It is also used by the playground and the dashboard.
 */
export class Column {
  constructor(column?: Partial<Column>) {
    // Allow the partial initialisation of a fragment object
    Object.assign(this, column);
  }

  author: string;
  title: string;
  editor: string;
  name: string;

  column_id: number; // has to be a string for cdkDrag
  type = ''; // denotes playground, commentary, text or fragment column

  selected_fragment_author = '';
  selected_fragment_title = '';
  selected_fragment_editor = '';
  selected_fragment_name = '';

  fragments: Fragment[] = [];
  fragment_names: any[] = [];
  documents: any[] = [];

  retrieved_authors: string[] = [];
  retrieved_titles: string[] = [];
  retrieved_editors: string[] = [];
  retrieved_fragment_names: string[] = [];

  note_array: string[] = [];

  clicked_document: Fragment;
  linked_fragments_content: Fragment[] = []; //FIXME: needs to be different from Fragment.linked_fragments

  clicked_note: string;

  // Boolean to keep track whether a column has seen a user edit
  edited = false;

  // Whether to show or hide the column
  visible = true;

  // Whether the column is newly created. If so, we show 'SELECT TEXT' button instead of the selected data
  new_column = true;

  // Original order of the column fragments
  original_fragment_order: string[] = [];

  // If fragments translated, shows translation in column and original text in the commentary
  translated = false;

  // Whether a column has bib items and therefore a possible bibliography
  has_bibliography = false;

  // Checks if the column is able to show fragment translations
  has_translations(): boolean {
    for (const i in this.documents) {
      if (this.documents[i].commentary.translation) {
        return true;
      }
    }
    return false;
  }
}
