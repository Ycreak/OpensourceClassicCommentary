// Library imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError, ReplaySubject, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@src/environments/environment';

// Service imports
import { UtilityService } from '@oscc/utility.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Testimonium } from '@oscc/models/Testimonium';
import { Bib } from '@oscc/models/Bib';
import { User } from '@oscc/models/User';
import { Introduction_form } from '@oscc/models/Introduction_form';
import { DialogService } from '@oscc/services/dialog.service';

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
  private post_data = {
    observe: 'body',
    responseType: 'json',
  };

  network_status: boolean; // Indicates if server is reachable or not
  spinner: boolean;

  constructor(private http: HttpClient, private utility: UtilityService, private dialog: DialogService) {
    this.network_status = true; // Assumed online until HttpErrorResponse is received.
  }

  public authors: author[] = [];
  public titles: title[] = [];
  public editors: editor[] = [];
  public fragment_names: fragment_name[] = [];
  public documents: any[] = [];
  public fragment_key: fragment_key = {};

  public author_title_editor_blob: any = [];

  public zotero: any = {};

  FlaskURL: string = environment.flask_api;
  NeuralURL: 'https://oscc.nolden.biz:5002/';

  public new_fragment_alert = new ReplaySubject(0);
  //public new_authors_alert = new ReplaySubject(0);
  public new_titles_alert = new ReplaySubject(0);
  public new_editors_alert = new ReplaySubject(0);

  private new_authors_alert = new BehaviorSubject<author[]>([]);
  public new_authors_alert$ = this.new_authors_alert.asObservable();

  private new_documents_alert = new BehaviorSubject<number>(-1);
  public new_documents_alert$ = this.new_documents_alert.asObservable();

  private new_fragment_names_alert = new BehaviorSubject<number>(-1);
  public new_fragment_names_alert$ = this.new_fragment_names_alert.asObservable();

  private new_document_names_alert = new BehaviorSubject<fragment_name[]>([]);
  public new_document_names_alert$ = this.new_document_names_alert.asObservable();

  private new_bib_alert = new BehaviorSubject<Bib[]>([]);
  public new_bib_alert$ = this.new_bib_alert.asObservable();

  private create_fragment_key(author?: string, title?: string, editor?: string, name?: string): fragment_key {
    const key: fragment_key = {};
    if (author) {
      key.author = author;
    }
    if (title) {
      key.title = title;
    }
    if (editor) {
      key.editor = editor;
    }
    if (name) {
      key.name = name;
    }
    return key;
  }

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

  public get_author_list(): object {
    const filtered_objects = this.author_title_editor_blob;
    const author_list = new Set(
      filtered_objects.map(function (el: any) {
        return el.author;
      })
    );
    return author_list;
  }

  public get_title_list(author: string): object {
    const filtered_objects = this.author_title_editor_blob.filter((x: any) => x.author == author);
    const title_list = new Set(
      filtered_objects.map(function (el: any) {
        return el.title;
      })
    );
    return title_list;
  }

  public get_editor_list(author: string, title: string): object {
    const filtered_objects = this.author_title_editor_blob.filter((x: any) => x.author == author && x.title == title);
    const editor_list = new Set(
      filtered_objects.map(function (el: any) {
        return el.editor;
      })
    );
    return editor_list;
  }

  public request_titles(author: string): void {
    this.titles = [];
    this.fragment_key = this.create_fragment_key(author);
    this.get_titles(this.fragment_key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          this.titles.push({ name: value } as title);
        });
        this.new_titles_alert.next(1);
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_editors(author: string, title: string): void {
    this.editors = [];
    this.fragment_key = this.create_fragment_key(author, title);
    this.get_editors(this.fragment_key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          this.editors.push({ name: value } as editor);
        });
        this.new_editors_alert.next(1);
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_document_names(key: any): void {
    const names: fragment_name[] = [];
    this.spinner_on();
    this.get_fragment_names(key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          names.push({ name: value } as fragment_name);
        });
        this.new_document_names_alert.next(names);
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_fragment_names(column_id: number, author: string, title: string, editor: string): void {
    this.spinner_on();
    this.fragment_names = [];
    this.fragment_key = this.create_fragment_key(author, title, editor);
    this.get_fragment_names(this.fragment_key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          this.fragment_names.push({ name: value } as fragment_name);
        });
        this.fragment_names = this.fragment_names.sort(this.utility.sort_fragment_array_numerically);
        this.new_fragment_names_alert.next(column_id);
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_zotero_data() {
    this.get(environment.zotero_url).subscribe({
      next: (data) => {
        const bib_list: Bib[] = [];
        for (const i in data) {
          const bib = new Bib();
          bib.set(data[i]);
          bib_list.push(bib);
        }
        this.zotero = bib_list;
        this.new_bib_alert.next(bib_list);
      },
    });
  }

  public request_documents(column_id: number, author: string, title: string, editor: string, name?: string): void {
    this.spinner_on();
    this.documents = [];
    this.fragment_key = this.create_fragment_key(author, title, editor);
    if (name) {
      this.fragment_key.name = name;
    }
    this.get_fragments(this.fragment_key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          const fragment = new Fragment();
          fragment.set_fragment(value);
          this.documents.push(fragment);
        });
        this.new_documents_alert.next(column_id);
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_create_fragment(fragment: any, column_id?: number): void {
    this.spinner_on();
    this.create_fragment(fragment).subscribe({
      next: (data) => {
        this.handle_error_message(data);
        this.request_authors_titles_editors_blob();
        if (column_id) {
          this.request_fragment_names(column_id, fragment.author, fragment.title, fragment.editor);
          this.request_documents(column_id, fragment.author, fragment.title, fragment.editor, fragment.name);
        }
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_revise_fragment(fragment: any, column_id?: number): void {
    this.spinner_on();
    this.revise_fragment(fragment).subscribe({
      next: (data) => {
        this.handle_error_message(data);
        this.request_authors_titles_editors_blob();
        if (column_id) {
          this.request_fragment_names(column_id, fragment.author, fragment.title, fragment.editor);
          this.request_documents(column_id, fragment.author, fragment.title, fragment.editor, fragment.name);
        }
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_delete_fragment(key: any): void {
    this.spinner_on();
    this.delete_fragment(key).subscribe({
      next: (data) => {
        this.handle_error_message(data);
        this.request_authors_titles_editors_blob();
        //if (column_id) {
        //this.request_fragment_names(column_id, author, title, editor);
        //}
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }
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

  public get_documents(key: any): Observable<any> {
    return new Observable((observer) => {
      this.http
        .post<any>(this.FlaskURL + `fragment/get`, key, {
          observe: 'body',
          responseType: 'json',
        })
        .subscribe((data: any) => {
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
          observer.next(documents);
          observer.complete();
        });
    });
  }

  /**
   * Requests documents from the server given a filter object
   * @param number of column_id
   * @param object of filter to apply to documents
   * @author Ycreak
   * @TODO: replace request_documents with this function
   */
  public request_documents_with_filter(column_id: number, filter: object): void {
    this.spinner_on();
    this.documents = [];
    this.get_fragments(filter).subscribe({
      next: (data) => {
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
          this.documents.push(new_document);
        });
        this.new_documents_alert.next(column_id);
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
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
   * Getter function for public property network_status
   * @return boolean network_status - Status indicating whether or not the server is
   *                                    successfully returning requests
   * @author CptVickers
   */
  public get_network_status(): boolean {
    return this.network_status;
  }

  /**
   * Converts the JSON from the server to a Typescript object
   * @author Ycreak
   * @TODO: can this be done automatically without being invoked from fragment.component?
   */
  public convert_fragment_json_to_typescript(data: any): Fragment[] {
    const fragment_list = [];
    for (const i in data) {
      const fragment = new Fragment();
      fragment.set_fragment(data[i]);
      fragment_list.push(fragment);
    }
    return fragment_list;
  }
  //   _____   ____   _____ _______
  //  |  __ \ / __ \ / ____|__   __|
  //  | |__) | |  | | (___    | |
  //  |  ___/| |  | |\___ \   | |
  //  | |    | |__| |____) |  | |
  //  |_|     \____/|_____/   |_|
  //TODO: what Observable type is a make_response?
  // Fragments
  public get_titles(fragment: object): Observable<string[]> {
    return this.http.post<string[]>(this.FlaskURL + `fragment/get/title`, fragment, {
      observe: 'body',
      responseType: 'json',
    });
  }
  public get_editors(fragment: object): Observable<string[]> {
    return this.http.post<string[]>(this.FlaskURL + `fragment/get/editor`, fragment, {
      observe: 'body',
      responseType: 'json',
    });
  }
  public get_fragments(fragment: object): Observable<object[]> {
    return this.http.post<Fragment[]>(this.FlaskURL + `fragment/get`, fragment, {
      observe: 'body',
      responseType: 'json',
    });
  }
  public get_fragment_names(fragment: object): Observable<string[]> {
    return this.http.post<string[]>(this.FlaskURL + `fragment/get/name`, fragment, {
      observe: 'body',
      responseType: 'json',
    });
  }
  public get_authors_titles_editors_blob(): Observable<string[]> {
    return this.http.post<string[]>(this.FlaskURL + `fragment/get/list_display`, {
      observe: 'body',
      responseType: 'json',
    });
  }
  public create_fragment(fragment: any): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `fragment/create`, fragment, {
      observe: 'response',
      responseType: 'text' as 'json',
    });
  }
  public revise_fragment(fragment: any): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `fragment/update`, fragment, {
      observe: 'response',
      responseType: 'text' as 'json',
    });
  }
  public delete_fragment(fragment: any): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `fragment/delete`, fragment, {
      observe: 'response',
      responseType: 'text' as 'json',
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
    this.spinner = true;
  }

  /**
   * Simple function to toggle the spinner
   * @author Ycreak
   */
  public spinner_off(): void {
    this.spinner = false;
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
