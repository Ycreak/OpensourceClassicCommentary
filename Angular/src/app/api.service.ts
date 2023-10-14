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

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Playground } from '@oscc/models/Playground';
import { Bib } from '@oscc/models/Bib';
import { Testimonium } from '@oscc/models/Testimonium';
import { User } from '@oscc/models/User';
import { Introduction_form } from '@oscc/models/Introduction_form';

export interface fragment_key {
  author?: string;
  title?: string;
  editor?: string;
  name?: string;
}

export interface text_blob {
  author: string;
  title: string;
  editor: string;
}

export interface author {
  name: string;
}

export interface title {
  name: string;
}

export interface editor {
  name: string;
}

export interface fragment_name {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  network_status: boolean; // Indicates if server is reachable or not
  concurrent_api_calls = 0;
  spinner: boolean;

  bibliography: Bib[] = [];

  constructor(private http: HttpClient, private utility: UtilityService) {
    this.network_status = true; // Assumed online until HttpErrorResponse is received.
  }

  public author_title_editor_blob: any = [];

  FlaskURL: string = environment.flask_api;
  NeuralURL: 'https://oscc.nolden.biz:5002/';

  /**
   * Requests the API for a blob of all author-title-editor combinations for easy filtering in Angular
   * @author Ycreak
   */
  public request_authors_titles_editors_blob(): void {
    this.spinner_on();
    this.author_title_editor_blob = [];
    this.get_authors_titles_editors_blob().subscribe({
      next: (data) => {
        data.forEach((value: any) => {
          this.author_title_editor_blob.push({
            author: value[0],
            title: value[1],
            editor: value[2],
          } as text_blob);
        });
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  /**
   * Provides a list of authors from the author-title-editor blob
   * @return author_list (array)
   * @author Ycreak
   */
  public get_author_list(): object {
    const filtered_objects = this.author_title_editor_blob;
    const author_list = new Set(
      filtered_objects.map(function (el: any) {
        return el.author;
      })
    );
    return author_list;
  }
  /**
   * Provides a list of titles from the author-title-editor blob
   * @param author (string)
   * @return title_list (array)
   * @author Ycreak
   */
  public get_title_list(author: string): object {
    const filtered_objects = this.author_title_editor_blob.filter((x: any) => x.author == author);
    const title_list = new Set(
      filtered_objects.map(function (el: any) {
        return el.title;
      })
    );
    return title_list;
  }
  /**
   * Provides a list of editors from the author-title-editor blob
   * @param author (string)
   * @param title (string)
   * @return title_list (array)
   * @author Ycreak
   */
  public get_editor_list(author: string, title: string): object {
    const filtered_objects = this.author_title_editor_blob.filter((x: any) => x.author == author && x.title == title);
    const editor_list = new Set(
      filtered_objects.map(function (el: any) {
        return el.editor;
      })
    );
    return editor_list;
  }

  /**
   * Performs a post with the given data to the given url + endpoint
   * @param url (string)
   * @param endpoint (string)
   * @param data (object)
   */
  public post(url: string, endpoint: string, data: object): Observable<any> {
    return this.http.post<string[]>(url + endpoint, data, {
      observe: 'body',
      responseType: 'json',
    });
  }

  /**
   * Creates the given fragment on the server
   * @param fragment (Fragment)
   * @author Ycreak
   */
  public create_fragment(fragment: any): void {
    this.spinner_on();
    this.http
      .post<string[]>(this.FlaskURL + `fragment/create`, fragment, {
        observe: 'response',
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (data) => {
          this.handle_error_message(data);
          this.request_authors_titles_editors_blob();
          this.spinner_off();
        },
        error: (err) => this.handle_error_message(err),
      });
  }
  /**
   * Revises the given fragment on the server
   * @param fragment (Fragment)
   * @author Ycreak
   */
  public revise_fragment(fragment: any): void {
    this.spinner_on();
    this.http
      .post<string[]>(this.FlaskURL + `fragment/update`, fragment, {
        observe: 'response',
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (data) => {
          this.handle_error_message(data);
          this.request_authors_titles_editors_blob();
          this.spinner_off();
        },
        error: (err) => this.handle_error_message(err),
      });
  }
  /**
   * Deletes the given fragment on the server
   * @param fragment (Fragment)
   * @author Ycreak
   */
  public delete_fragment(fragment: any): void {
    this.spinner_on();
    this.http
      .post<string[]>(this.FlaskURL + `fragment/delete`, fragment, {
        observe: 'response',
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (data) => {
          this.handle_error_message(data);
          this.request_authors_titles_editors_blob();
          this.spinner_off();
        },
        error: (err) => this.handle_error_message(err),
      });
  }

  /**
   * Retrieves document names from the given key
   * @param key (object)
   * @return document_names (list)
   * @author Ycreak
   */
  public get_names(key: any): Observable<any> {
    return new Observable((observer) => {
      this.http
        .post<string[]>(this.FlaskURL + `fragment/get/name`, key, {
          observe: 'body',
          responseType: 'json',
        })
        .subscribe((data: any) => {
          const names: fragment_name[] = [];
          data.forEach((value: any) => {
            names.push({ name: value } as fragment_name);
          });
          observer.next(names);
          observer.complete();
        });
    });
  }

  /**
   * Retrieves document authors from the given key
   * @param key (object)
   * @return document_names (list)
   * @author Ycreak
   */
  public get_authors(key: any): Observable<any> {
    return new Observable((observer) => {
      this.http
        .post<any>(this.FlaskURL + `fragment/get/author`, key, {
          observe: 'body',
          responseType: 'json',
        })
        .subscribe((data: any) => {
          const authors: author[] = [];
          data.forEach((value: any) => {
            authors.push({ name: value } as author);
          });
          observer.next(authors);
          observer.complete();
        });
    });
  }

  /**
   * Retrieves document authors from the given key
   * @param key (object)
   * @return document_names (list)
   * @author Ycreak
   */
  public get_document_names(filter: object): Observable<any> {
    this.spinner_on();
    return new Observable((observer) => {
      let document_names: fragment_name[] = [];
      this.post(this.FlaskURL, 'fragment/get/name', filter).subscribe((data: any) => {
        data.forEach((value: any) => {
          document_names.push({ name: value } as fragment_name);
        });
        document_names = document_names.sort(this.utility.sort_fragment_array_numerically);
        this.spinner_off();
        observer.next(document_names);
        observer.complete();
      });
    });
  }

  /**
   * Retrieve documents from the server given the filter
   * @param filter (object) on which to filter documents
   * @return documents (document[])
   * @author Ycreak
   */
  public get_documents(filter: any): Observable<any> {
    return new Observable((observer) => {
      this.spinner_on();
      this.post(this.FlaskURL, 'fragment/get', filter).subscribe((data: any) => {
        const documents: any[] = [];
        data.forEach((value: any) => {
          let new_document: any;
          if (value.document_type == 'fragment') {
            new_document = new Fragment({});
            new_document.set_fragment(value);
          } else if (value.document_type == 'testimonium') {
            new_document = new Testimonium({});
            new_document.set(value);
          } else {
            console.error('unknown document type');
          }
          documents.push(new_document);
        });
        this.spinner_off();
        observer.next(documents);
        observer.complete();
      });
    });
  }

  /**
   * Function to request the introduction text for a given author or author + title.
   * @param intro Introduction object with form data; contains selected author and title data.
   * @author CptVickers
   */
  public request_introduction(intro: Introduction_form): void {
    this.get_introduction_text(intro).subscribe((data) => {
      if (data) {
        // Store the received introduction data in the form
        intro.author_text = data['author_text'];
        intro.title_text = data['title_text'];
        return intro;
      }
    });
  }

  /**
   * Function to save the introduction text for a given author or author + title.
   * @param intro: Introduction object with form data; contains selected author and title data,
   *               as well as the introduction text to be saved.
   * @returns A text message indicating success/failure.
   * @author CptVickers
   */
  public request_save_introduction(Introduction_form: Introduction_form): string {
    const request: Observable<any> = this.set_introduction_text(Introduction_form);
    let result = '';

    request.subscribe({
      next: (data) => {
        result += data;
      },
      error: (err) => {
        result += err;
        this.handle_error_message(err);
      },
    });
    return result;
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
          this.bibliography = bib_list;
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
          this.bibliography = bib_list;
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
      this.post(this.FlaskURL, 'playground/get', filter).subscribe((data: any) => {
        this.spinner_off();
        observer.next(data[0]);
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
      this.post(this.FlaskURL, 'playground/get/name', filter).subscribe((data: any) => {
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
          this.handle_error_message(data);
          this.spinner_off();
        },
        error: (err) => this.handle_error_message(err),
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
          this.handle_error_message(data);
          this.spinner_off();
        },
        error: (err) => this.handle_error_message(err),
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
          this.handle_error_message(data);
          this.spinner_off();
        },
        error: (err) => this.handle_error_message(err),
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
  // Introduction
  public get_introduction_text(intro: Introduction_form): Observable<any> {
    return this.http.post<any>(this.FlaskURL + 'introduction/get_introduction_text', intro, {
      observe: 'body',
      responseType: 'json',
    });
  }
  public set_introduction_text(intro: Introduction_form): Observable<any> {
    return this.http.post<any>(this.FlaskURL + 'introduction/set_introduction_text', intro, {
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
   * Function to handle the error err. Calls Snackbar to show it on screen
   * @param err the generated error
   * @author Ycreak
   */
  public handle_error_message(err: any): void {
    this.spinner_off();
    let output = '';

    console.log(err);

    if (err.ok) {
      output = err.status + ': ' + err.body;
    } else {
      output = err.status + ': ' + err.error;
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
