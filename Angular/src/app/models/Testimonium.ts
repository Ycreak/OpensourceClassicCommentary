import { Commentary } from '@oscc/models/Commentary';

/** This class represents a testimonium and all its data fields */
export class Testimonium {
  language = '';
  genre = '';
  document_type = 'testimonium';
  // Meta data
  _id = '';
  name = '';
  author = '';
  witness = '';
  title = '';
  text = '';
  translation = '';
  // Commentary
  commentary: Commentary;

  // Keeps track whether we tranlated this testimonium using the column translate functionality
  translated = false;

  constructor(testimonium?: Partial<Testimonium>) {
    // Allow the partial initialisation of a testimonium
    Object.assign(this, testimonium);
  }

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param testimonium with JSON data received from the server
   * @author Ycreak
   */
  public set(testimonium: any) {
    console.log(testimonium, 'in set');
    this._id = '_id' in testimonium ? testimonium['_id'] : '';
    this.author = 'author' in testimonium ? testimonium['author'] : '';
    this.title = 'title' in testimonium ? testimonium['title'] : '';
    this.name = 'name' in testimonium ? testimonium['name'] : '';
    this.text = 'text' in testimonium ? testimonium['text'] : '';
    this.witness = 'witness' in testimonium ? testimonium['witness'] : '';

    this.commentary = new Commentary({});
    this.commentary.set(testimonium);
  }
}
