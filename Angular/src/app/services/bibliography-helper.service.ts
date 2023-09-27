import { Injectable } from '@angular/core';
import { ApiService } from '@oscc/api.service';

@Injectable({
  providedIn: 'root',
})
export class BibliographyHelperService {
  constructor(protected api: ApiService) {}

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
    return `<p>${bib_item.creators[0].lastname} (${bib_item.date}) ${bib_item.title}</p>`;
  }
}
