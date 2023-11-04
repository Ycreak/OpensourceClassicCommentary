import { Context } from '@oscc/models/Context';

export interface Fields {
  apparatus: string;
  commentary: string;
  context: Context[];
  differences: string;
  metrical_analysis: string;
  reconstruction: string;
  translation: string;
}

/**
 * This class represents a commentary and all its data fields.
 * It is linked to a document. For example: a fragment has a commentary
 */
export class Commentary {
  // All commentary fields are stored in this interface.
  fields: Fields;

  bibliography = '';

  constructor(commentary?: Partial<Commentary>) {
    // Allow the partial initialisation of the object
    Object.assign(this, commentary);
  }

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param doc (object) with JSON data received from the server
   * @author Ycreak
   */
  public set(doc: any) {
    this.bibliography = '';

    const apparatus = 'apparatus' in doc && doc['apparatus'] != null ? doc['apparatus'] : '';
    const translation = 'translation' in doc && doc['translation'] != null ? doc['translation'] : '';
    const commentary = 'commentary' in doc && doc['commentary'] != null ? doc['commentary'] : '';
    const reconstruction = 'reconstruction' in doc && doc['reconstruction'] != null ? doc['reconstruction'] : '';
    const differences = 'differences' in doc && doc['differences'] != null ? doc['differences'] : '';
    const metrical_analysis =
      'metrical_analysis' in doc && doc['metrical_analysis'] != null ? doc['metrical_analysis'] : '';
    const context = 'context' in doc && doc['context'] != null ? doc['context'] : [];

    this.fields = {
      apparatus: apparatus,
      commentary: commentary,
      context: context,
      differences: differences,
      metrical_analysis: metrical_analysis,
      reconstruction: reconstruction,
      translation: translation,
    } as Fields;
  }

  /**
   * Returns true if the given fragment has one of its content fields filled
   * @param fragment to be investigated for content
   * @returns boolean whether content is present
   * @author Ycreak
   */
  public has_content() {
    return (
      this.fields.apparatus != '' ||
      this.fields.commentary != '' ||
      this.fields.differences != '' ||
      this.fields.reconstruction != '' ||
      this.fields.translation != ''
    );
  }
}
