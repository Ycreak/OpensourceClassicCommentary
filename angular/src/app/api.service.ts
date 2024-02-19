// Library imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@src/environments/environment';

// Service imports
import { UtilityService } from '@oscc/utility.service';
import { BibliographyService } from '@oscc/services/bibliography.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Playground } from '@oscc/models/Playground';
import { Bib } from '@oscc/models/Bib';
import { User } from '@oscc/models/User';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected http: HttpClient;

  network_status: boolean; // Indicates if server is reachable or not
  concurrent_api_calls = 0;
  public spinner: boolean;

  // We define headers for our post() functions. For receiving data we expect a different response
  // than for post data.
  public post_header: object = { observe: 'response', responseType: 'text' as 'json' };
  public get_header: object = { observe: 'body', responseType: 'json' };

  constructor(
    private bib: BibliographyService,
    protected utility: UtilityService,
    http: HttpClient
  ) {
    this.http = http;
    this.network_status = true; // Assumed online until HttpErrorResponse is received.
  }

  FlaskURL: string = environment.flask_api;
  NeuralURL: 'https://oscc.nolden.biz:5002/';

  /**
   * Performs a post with the given data to the given url + endpoint
   * @param url (string)
   * @param endpoint (string)
   * @param data (object)
   */
  public post(url: string, endpoint: string, data: object, header: object): Observable<any> {
    return this.http.post<string[]>(url + endpoint, data, header);
  }

  /**
   * Gets a unique list of values from the given key, when applying the given filter
   * on the index file
   * @param key (string)
   * @param filter (object)
   * @author Ycreak
   */
  protected get_from_index(key: string, index: any[], filter: object): string[] {
    return this.utility.get_set_of_key_values_from_object_list(this.utility.filter_array(index, filter), key);
  }

  /**
   * Asks Flask to resync the Zotero bibliography. Receives synced bibliography
   * @param key (object)
   * @return document_names (list)
   * @author Ycreak
   */
  public sync_bibliography(): Observable<any> {
    return new Observable((observer) => {
      this.http
        .post<any>(this.FlaskURL + `bibliography/sync`, {
          observe: 'body',
          responseType: 'json',
        })
        .subscribe((data: any) => {
          const bib_list: Bib[] = [];
          data.forEach((item: any) => {
            const bib = new Bib();
            bib.set(item);
            bib_list.push(bib);
          });
          this.bib.bibliography = bib_list;
          observer.next(data);
          observer.complete();
        });
    });
  }

  /**
   * Retrieves the Zotero bibliography from the Flask server
   * @param key (object)
   * @return document_names (list)
   * @author Ycreak
   */
  public get_bibliography(): Observable<any> {
    return new Observable((observer) => {
      this.http
        .post<any>(this.FlaskURL + `bibliography/get`, {
          observe: 'body',
          responseType: 'json',
        })
        .subscribe((data: any) => {
          const bib_list: Bib[] = [];
          data.forEach((item: any) => {
            const bib = new Bib();
            bib.set(item);
            bib_list.push(bib);
          });
          this.bib.bibliography = bib_list;
          observer.next(data);
          observer.complete();
        });
    });
  }

  /**
   * Retrieves playground from the given key
   * @param key (object)
   * @return playground (object)
   * @author Ycreak
   */
  public get_playground(filter: object): Observable<any> {
    this.spinner_on();
    return new Observable((observer) => {
      this.post(this.FlaskURL, 'playground/get', filter, this.get_header).subscribe((data: any) => {
        this.spinner_off();
        observer.next(data[0]);
        observer.complete();
      });
    });
  }
  /**
   * Retrieves playgrounds shared with the given user
   * @param key (object)
   * @return playgrounds (object)
   * @author Ycreak
   */
  public get_shared_playgrounds(filter: object): Observable<any> {
    this.spinner_on();
    return new Observable((observer) => {
      this.post(this.FlaskURL, 'playground/get/shared', filter, this.get_header).subscribe((data: any) => {
        this.spinner_off();
        observer.next(data);
        observer.complete();
      });
    });
  }
  /**
   * Retrieves playground names from the given key
   * @param key (object)
   * @return playground_names (list)
   * @author Ycreak
   */
  public get_playground_names(filter: object): Observable<any> {
    this.spinner_on();
    return new Observable((observer) => {
      this.post(this.FlaskURL, 'playground/get/name', filter, this.get_header).subscribe((data: any) => {
        this.spinner_off();
        observer.next(data);
        observer.complete();
      });
    });
  }

  /**
   * Creates the given playground on the server
   * @param playground (Playground)
   * @author Ycreak
   */
  public create_playground(playground: Playground): void {
    this.spinner_on();
    this.http
      .post<string[]>(this.FlaskURL + `playground/create`, playground, {
        observe: 'response',
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (data) => {
          this.show_server_response(data);
          this.spinner_off();
        },
        error: (err) => this.show_server_response(err),
      });
  }
  /**
   * Saves the given playground on the server
   * @param playground (json)
   * @author Ycreak
   */
  public save_playground(playground: any): void {
    this.spinner_on();
    this.http
      .post<string[]>(this.FlaskURL + `playground/update`, playground, {
        observe: 'response',
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (data) => {
          this.show_server_response(data);
          this.spinner_off();
        },
        error: (err) => this.show_server_response(err),
      });
  }
  /**
   * Deletes the given playground from the server
   * @param name (string)
   * @author Ycreak
   */
  public delete_playground(playground: any): void {
    this.spinner_on();
    this.http
      .post<string[]>(this.FlaskURL + `playground/delete`, playground, {
        observe: 'response',
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (data) => {
          this.show_server_response(data);
          this.spinner_off();
        },
        error: (err) => this.show_server_response(err),
      });
  }

  /**
   * Getter function for public property network_status
   * @return boolean network_status - Status indicating whether or not the server is
   *                                    successfully returning requests
   * @author CptVickers
   */
  public get_network_status(): boolean {
    return this.network_status;
  }

  //   _____   ____   _____ _______
  //  |  __ \ / __ \ / ____|__   __|
  //  | |__) | |  | | (___    | |
  //  |  ___/| |  | |\___ \   | |
  //  | |    | |__| |____) |  | |
  //  |_|     \____/|_____/   |_|
  //TODO: what Observable type is a make_response?
  public get_authors_titles_editors_blob(): Observable<string[]> {
    return this.http.post<string[]>(this.FlaskURL + `fragment/get/list_display`, {
      observe: 'body',
      responseType: 'json',
    });
  }
  public automatic_fragment_linker(fragment: Fragment): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `automatic_fragment_linker`, fragment, {
      observe: 'response',
      responseType: 'text' as 'json',
    });
  }
  // Users
  public get_users(user: User): Observable<User[]> {
    return this.http.post<User[]>(this.FlaskURL + `user/get`, user, { observe: 'body', responseType: 'json' });
  }
  public login_user(user: User): Observable<User> {
    return this.http.post<User>(this.FlaskURL + `user/login`, user, { observe: 'body', responseType: 'json' });
  }
  public create_user(user: User): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `user/create`, user, {
      observe: 'response',
      responseType: 'text' as 'json',
    });
  }
  public delete_user(user: User): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `user/delete`, user, {
      observe: 'response',
      responseType: 'text' as 'json',
    });
  }
  public user_update(user: User | object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `user/update`, user, {
      observe: 'response',
      responseType: 'text' as 'json',
    });
  }
  // Neural networks part
  public scan_lines(lines: object): Observable<any> {
    return this.http.post<any>(this.NeuralURL + `scan_lines`, lines, { observe: 'body', responseType: 'json' });
  }

  public get(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  /**
   * Function to show the server response. Calls Snackbar to show it on screen
   * @param the generated error
   * @author Ycreak
   */
  public show_server_response(message: any): void {
    console.log(message);
    this.spinner_off();
    let output = '';

    if (message.statusText == 'OK') {
      output = message.status + ': ' + message.body;
    } else {
      output = message.status + ': ' + message.error;
    }
    this.utility.open_snackbar(output);
  }

  /**
   * Simple function to toggle the spinner
   * @author Ycreak
   */
  public spinner_on(): void {
    this.concurrent_api_calls += 1;
    this.spinner = this.concurrent_api_calls > 0;
  }

  /**
   * Simple function to toggle the spinner
   * @author Ycreak
   */
  public spinner_off(): void {
    this.concurrent_api_calls -= 1;
    this.spinner = this.concurrent_api_calls > 0;
  }
}

// Interceptor for HTTP errors
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private api: ApiService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap({
        next: (res) => {
          this.api.network_status = true; // Set network status to true on successful response
          console.debug(res);
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status == 0) {
              // If server is unavailable
              this.api.network_status = false; // Set network status to false on unsuccessful response
            }
          }
          return throwError(() => err);
        },
      })
    );
  }
}
