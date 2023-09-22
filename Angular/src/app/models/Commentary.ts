import { Context } from '@oscc/models/Context';
import { Line } from '@oscc/models/Line';

/**
 * This class represents a commentary and all its data fields.
 * It is linked to a document. For example: a fragment has a commentary
 */
export class Commentary {
  translation = '';
  commentary = '';
  apparatus = '';
  reconstruction = '';
  differences = '';
  metrical_analysis = '';
  context: Context[] = [];

  lines: Line[] = [];

  bibliography = '';

  constructor(commentary?: Partial<Commentary>) {
    // Allow the partial initialisation of a fragment object
    Object.assign(this, commentary);
  }

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param fragment with JSON data received from the server
   * @author Ycreak
   */
  public set(fragment: any) {
    this.bibliography = '';
    this.translation = 'translation' in fragment && fragment['translation'] != null ? fragment['translation'] : '';
    this.commentary = 'commentary' in fragment && fragment['commentary'] != null ? fragment['commentary'] : '';
    this.apparatus = 'apparatus' in fragment && fragment['apparatus'] != null ? fragment['apparatus'] : '';
    this.reconstruction =
      'reconstruction' in fragment && fragment['reconstruction'] != null ? fragment['reconstruction'] : '';
    this.differences = 'differences' in fragment && fragment['differences'] != null ? fragment['differences'] : '';
    this.metrical_analysis =
      'metrical_analysis' in fragment && fragment['metrical_analysis'] != null ? fragment['metrical_analysis'] : '';
    this.context = 'context' in fragment && fragment['context'] != null ? fragment['context'] : [];
  }

  /**
   * Returns true if the given fragment has one of its content fields filled
   * @param fragment to be investigated for content
   * @returns boolean whether content is present
   * @author Ycreak
   */
  public has_content() {
    return (
      this.differences != '' ||
      this.apparatus != '' ||
      this.translation != '' ||
      this.commentary != '' ||
      this.reconstruction != ''
    );
  }
}
