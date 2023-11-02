import { Apparatus_field } from '@oscc/models/commentary/Apparatus';
import { Commentary_field } from '@oscc/models/commentary/Commentary';
import { Context_field } from '@oscc/models/commentary/Context';
import { Differences_field } from '@oscc/models/commentary/Differences';
import { Reconstruction_field } from '@oscc/models/commentary/Reconstruction';
import { Translation_field } from '@oscc/models/commentary/Translation';

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
  context: Context_field[] = [];

  lines: Line[] = [];

  bibliography = '';

  fields: any = {
    apparatus: [],
    commentary: [],
    context: [],
    differences: [],
    reconstruction: [],
    translation: [],
  };

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

    if ('apparatus' in fragment && fragment['apparatus'] != '') {
      this.fields.apparatus.push(
        new Apparatus_field({
          text: fragment['apparatus'],
        })
      );
    }

    if ('commentary' in fragment && fragment['commentary'] != '') {
      this.fields.commentary.push(
        new Commentary_field({
          text: fragment['commentary'],
        })
      );
    }

    const contexts = 'context' in fragment && fragment['context'] != null ? fragment['context'] : [];
    contexts.forEach((context: any) => {
      this.fields.context.push(new Context_field(context));
    });

    if ('differences' in fragment && fragment['differences'] != '') {
      this.fields.differences.push(
        new Differences_field({
          text: fragment['differences'],
        })
      );
    }

    if ('reconstruction' in fragment && fragment['reconstruction'] != '') {
      this.fields.reconstruction.push(
        new Reconstruction_field({
          text: fragment['reconstruction'],
        })
      );
    }

    if ('translation' in fragment && fragment['translation'] != '') {
      this.fields.translation.push(
        new Translation_field({
          text: fragment['translation'],
        })
      );
    }
    console.log('fields', fragment.name, this.fields);
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
