import { Injectable } from '@angular/core';

// Model imports
import { Commentary } from '@oscc/models/Commentary';
import { Bib } from '@oscc/models/Bib';

// Service imports
import { UtilityService } from '@oscc/utility.service';

@Injectable({
  providedIn: 'root',
})
export class BibliographyService {
  public bibliography: Bib[] = [];

  constructor(private utility: UtilityService) {}

  /**
   * Retrieves a list of bibliography keys from the given document
   * @param doc (Fragment | Testimonium)
   * @return list with bib key strings
   * @author Ycreak
   */
  public get_keys_from_document(doc: any): string[] {
    return this.get_keys_from_commentary(doc.commentary);
  }

  /**
   * Retrieves all bib keys from the given commentary object
   * @param commentary (Commentary)
   * @return bib_keys (string[])
   * @author Ycreak
   */
  public get_keys_from_commentary(commentary: Commentary): string[] {
    let bib_keys: string[] = [];

    const commentary_fields_keys = Object.keys(commentary.fields);
    commentary_fields_keys.forEach((key: string) => {
      if (this.utility.is_string(commentary.fields[key])) {
        bib_keys = bib_keys.concat(this.get_bib_keys(commentary.fields[key]));
      } else if (this.utility.is_array(commentary.fields[key])) {
        commentary.fields[key].forEach((obj: any) => {
          bib_keys = bib_keys.concat(this.get_bib_keys(obj.text));
        });
      }
    });
    bib_keys = [...new Set(bib_keys)];
    return bib_keys;
  }

  /**
   * Retrieves all bib_keys in the given string in a list
   * @param given_string (string)
   * @return string[] with bib keys
   * @author Ycreak
   */
  public get_bib_keys(given_string: string): string[] {
    const bib_keys: string[] = [];

    const bib_regex = /\[bib-([\s\S]*?)\]/gm;
    const bib_entries = [...given_string.matchAll(bib_regex)];
    if (bib_entries?.length) {
      bib_entries.forEach((entry) => {
        const bib_key = entry[1].split('-')[0];
        bib_keys.push(bib_key);
      });
    }
    return bib_keys;
  }

  /**
   * Converts a list of bibliography keys into a string of citations
   * @param bib_keys (list)
   * @return string
   * @author Ycreak
   */
  public convert_keys_into_bibliography(bib_keys: string[]): string {
    const citations: string[] = [];
    let string_bibliography = '';

    bib_keys.forEach((key: string) => {
      citations.push(this.convert_bib_key_into_citation(key));
    });
    citations.sort().forEach((citation: string) => {
      string_bibliography += citation;
    });
    return string_bibliography;
  }

  /**
   * Returns the citation given the bib_key
   * @param bib_key (string)
   * @return string
   */
  public convert_bib_key_into_citation(bib_key: string): string {
    const bib_item = this.bibliography.find((o) => o.key === bib_key);
    //Add the item to the bibliography for easy printing in an expansion panel
    return bib_item.citation;
  }

  /**
   * Checks whether the given document has a bibliography
   * @param doc (document)
   * @return boolean
   * @author Ycreak
   */
  public check_document_bibliography(doc: any): boolean {
    return doc.bib_keys.length > 0;
  }

  /**
   * Checks whether the given documents have a bibliography
   * @param documents (list)
   * @return boolean
   * @author Ycreak
   */
  public check_documents_bibliography(documents: any): boolean {
    let has_bib = false;
    documents.forEach((doc: any) => {
      if (this.check_document_bibliography(doc)) {
        has_bib = true;
      }
    });
    return has_bib;
  }
}
