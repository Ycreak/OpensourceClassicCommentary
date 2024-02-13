/**
 * This service handles the server communication regarding testimonia
 * @author Ycreak
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Service imports
import { ApiService } from '@oscc/api.service';
import { BibliographyService } from '../bibliography.service';
import { UtilityService } from '@oscc/utility.service';

// Model imports
import { Testimonium } from '@oscc/models/Testimonium';

export interface testimonia_index {
  author: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class TestimoniaApiService extends ApiService {
  // Index file of all testimonia
  public testimonia_index: any = [];

  constructor(bib: BibliographyService, utility: UtilityService, http: HttpClient) {
    super(bib, utility, http);
  }

  /**
   * Requests the API for the testimonia index
   * @return Observable
   * @author Ycreak
   */
  public request_index(): Observable<any> {
    return new Observable((observer) => {
      this.spinner_on();
      this.testimonia_index = [];
      this.post(this.FlaskURL, 'testimonium/get/index', {}).subscribe({
        next: (data) => {
          data.forEach((value: any) => {
            this.testimonia_index.push({
              author: value[0],
              name: value[1],
            } as testimonia_index);
          });
          this.spinner_off();
          observer.next();
          observer.complete();
        },
        error: (err) => this.handle_error_message(err),
      });
    });
  }

  /**
   * Retrieve testimonia from the server given the filter
   * @param filter (object) on which to filter documents
   * @return list (Testimonia)
   * @author Ycreak
   */
  public request(filter: any): Observable<any> {
    return new Observable((observer) => {
      this.spinner_on();
      this.post(this.FlaskURL, 'testimonium/get', filter).subscribe((data: any) => {
        const documents: any[] = [];
        data.forEach((value: any) => {
          const new_testimonium = new Testimonium({});
          new_testimonium.set(value);
          documents.push(new_testimonium);
        });
        this.spinner_off();
        observer.next(documents);
        observer.complete();
      });
    });
  }

  /**
   * Gives the given endpoint the given testimonium. Used to create, revise and delete documents.
   * @param testimonium (Testimonium)
   * @param endpoint (string)
   * @returns Observable
   * @author Ycreak
   */
  public do(testimonium: any, endpoint: string): Observable<any> {
    return new Observable((observer) => {
      this.spinner_on();
      this.http
        .post<string[]>(this.FlaskURL + endpoint, testimonium, {
          observe: 'response',
          responseType: 'text' as 'json',
        })
        .subscribe({
          next: (data) => {
            this.handle_error_message(data);
            this.request_index();
            this.spinner_off();
            observer.next();
            observer.complete();
          },
          error: (err) => this.handle_error_message(err),
        });
    });
  }

  /**
   * Retrieves a unique set of authors from the testimonia index
   * @return list
   * @author Ycreak
   */
  public _authors(): string[] {
    return this.utility.get_set_of_key_values_from_object_list(
      this.utility.filter_array(this.testimonia_index, {}),
      'author'
    );
  }

  /**
   * Retrieves a unique set of names from the testimonia index, given the author
   * @param author (string)
   * @return list
   * @author Ycreak
   */
  public _names(author: string): string[] {
    return this.utility.get_set_of_key_values_from_object_list(
      this.utility.filter_array(this.testimonia_index, { author: author }),
      'name'
    );
  }
}
