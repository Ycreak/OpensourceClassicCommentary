import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Service imports
import { ApiService } from '@oscc/api.service';
import { BibliographyService } from '../bibliography.service';
import { UtilityService } from '@oscc/utility.service';

// Model imports
import { Introduction } from '@oscc/models/Introduction';

@Injectable({
  providedIn: 'root',
})
export class IntroductionsApiService extends ApiService {
  public remove = 'introduction/delete';
  public create = 'introduction/create';
  public revise = 'introduction/update';
  public retrieve = 'introduction/get';

  constructor(bib: BibliographyService, utility: UtilityService, http: HttpClient) {
    super(bib, utility, http);
  }

  /**
   * Function to request the introduction text for a given author or author + title.
   * @param intro Introduction object with form data; contains selected author and title data.
   * @author CptVickers, Ycreak
   */
  public get_introduction(filter: any): Observable<any> {
    return new Observable((observer) => {
      this.spinner_on();
      this.post(this.FlaskURL, this.retrieve, filter, this.get_header).subscribe({
        next: (data: any) => {
          const new_introduction = new Introduction({});
          new_introduction.set(data);
          this.spinner_off();
          observer.next(new_introduction);
          observer.complete();
        },
        error: (err) => this.show_server_response(err),
      });
    });
  }

  /**
   * Gives the given endpoint the given introduction. Used to create, revise and delete documents.
   * @param introduction (Introduction)
   * @param endpoint (string)
   * @returns Observable
   * @author Ycreak
   */
  public post_document(introduction: Introduction, endpoint: string): Observable<any> {
    return new Observable((observer) => {
      this.spinner_on();
      this.post(this.FlaskURL, endpoint, introduction, this.post_header).subscribe({
        next: (data) => {
          this.show_server_response(data);
          this.spinner_off();
          observer.next();
          observer.complete();
        },
        error: (err) => this.show_server_response(err),
      });
    });
  }
}
