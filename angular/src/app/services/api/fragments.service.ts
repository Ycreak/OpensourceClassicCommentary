/**
 * This service handles the server communication regarding fragments
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
import { Fragment } from '@oscc/models/Fragment';

export interface fragments_index {
  author: string;
  title: string;
  editor: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class FragmentsApiService extends ApiService {
  // Index file of all fragments
  public fragments_index: any = [];

  public remove = 'fragment/delete';
  public create = 'fragment/create';
  public revise = 'fragment/update';
  public retrieve = 'fragment/get';
  public index = 'fragment/get/index';

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
      this.fragments_index = [];
      this.post(this.FlaskURL, this.index, {}, this.get_header).subscribe({
        next: (data) => {
          data.forEach((value: any) => {
            this.fragments_index.push({
              author: value[0],
              title: value[1],
              editor: value[2],
              name: value[3],
            } as fragments_index);
          });
          this.spinner_off();
          observer.next(this.fragments_index);
          observer.complete();
        },
        error: (err) => this.show_server_response(err),
      });
    });
  }

  /**
   * Retrieve testimonia from the server given the filter
   * @param filter (object) on which to filter documents
   * @return list (Testimonia)
   * @author Ycreak
   */
  public request_documents(filter: any): Observable<any> {
    return new Observable((observer) => {
      this.spinner_on();
      this.post(this.FlaskURL, this.retrieve, filter, this.get_header).subscribe({
        next: (data) => {
          const documents: any[] = [];
          data.forEach((value: any) => {
            const new_fragment = new Fragment();
            new_fragment.set(value);
            documents.push(new_fragment);
          });
          this.spinner_off();
          observer.next(documents);
          observer.complete();
        },
        error: (err) => this.show_server_response(err),
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
  public post_document(testimonium: any, endpoint: string): Observable<any> {
    return new Observable((observer) => {
      this.spinner_on();
      this.post(this.FlaskURL, endpoint, testimonium, this.post_header).subscribe({
        next: (data) => {
          this.show_server_response(data);
          this.request_index().subscribe({});
          this.spinner_off();
          observer.next();
          observer.complete();
        },
        error: (err) => this.show_server_response(err),
      });
    });
  }

  /**
   * Retrieves a unique set of authors from the fragments index
   * @return list
   * @author Ycreak
   */
  public _authors(): string[] {
    return this.get_from_index('author', this.fragments_index, {});
  }

  /**
   * Retrieves a unique set of titles from the fragments index, given the author
   * @param author (string)
   * @return list
   * @author Ycreak
   */
  public _titles(author: string): string[] {
    return this.get_from_index('title', this.fragments_index, { author: author });
  }

  /**
   * Retrieves a unique set of editors from the fragments index, given the author and title
   * @param author (string)
   * @param title (string)
   * @return list
   * @author Ycreak
   */
  public _editors(author: string, title: string): string[] {
    return this.get_from_index('editor', this.fragments_index, { author: author, title: title });
  }

  /**
   * Retrieves a unique set of names from the fragments index, given the author, title and editor
   * @param author (string)
   * @param title (string)
   * @param editor (string)
   * @return list
   * @author Ycreak
   */
  public _names(author: string, title: string, editor: string): string[] {
    return this.get_from_index('name', this.fragments_index, { author: author, title: title, editor: editor }).sort(
      this.utility.sort_array_numerically
    );
  }
}
