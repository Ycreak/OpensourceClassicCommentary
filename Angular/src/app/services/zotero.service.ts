import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@src/environments/environment';

import { Bib } from '@oscc/models/Bib';
import { UtilityService } from '@oscc/utility.service';

@Injectable({
  providedIn: 'root',
})
export class ZoteroService {
  public bibliography: Bib[] = [];

  constructor(private http: HttpClient, private utility: UtilityService) {}

  public get(url: string): Observable<any> {
    return this.http.get<any>(url);
  }
  /**
   * Returns the zotero item given the key.
   * @param key (string)
   * @return zotero_item (object)
   * @author Ycreak
   */
  public get_zotero_item(key: any): Observable<any> {
    return new Observable((observer) => {
      const zotero_link = environment.zotero_item.replace('<key>', key);
      this.get(zotero_link).subscribe((data: any) => {
        const bib = new Bib();
        bib.set(data);
        observer.next(bib);
        observer.complete();
      });
    });
  }
  /**
   * Returns the zotero bibliography. If not yet retrieved, does so.
   * @author Ycreak
   */
  public request_bibliography(): void {
    if (this.utility.is_empty_array(this.bibliography)) {
      this.get(environment.zotero_url).subscribe({
        next: (data: any) => {
          const bib_list: Bib[] = [];
          for (const i in data) {
            const bib = new Bib();
            bib.set(data[i]);
            bib_list.push(bib);
          }
          this.bibliography = bib_list;
        },
      });
    }
  }
}
