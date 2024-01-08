import { Injectable } from '@angular/core';

// Model imports
import { Commentary } from '@oscc/models/Commentary';

// Service imports
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';

@Injectable({
  providedIn: 'root',
})
export class BibliographyHelperService {
  constructor(
    private utility: UtilityService,
    protected api: ApiService
  ) {}

  /**
   * Retrieves all bib keys from the given commentary object
   * @param commentary (Commentary)
   * @return bib_keys (string[])
   * @author Ycreak
   */
  public retrieve_bib_keys_from_commentary(commentary: Commentary): string[] {
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
   * Returns the citation given the bib_key
   * @param bib_key (string)
   * @return string
   */
  public convert_bib_key_into_citation(bib_key: string): string {
    const bib_item = this.api.bibliography.find((o) => o.key === bib_key);
    //Add the item to the bibliography for easy printing in an expansion panel
    return bib_item.citation;
  }
}
