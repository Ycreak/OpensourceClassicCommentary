// Library imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError, ReplaySubject, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@src/environments/environment';

// Service imports
import { UtilityService } from './utility.service';

// Model imports
import { Fragment } from './models/Fragment';
import { Column } from './models/Column';
import { User } from './models/User';

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
  spinner: boolean;

  constructor(private http: HttpClient, private utility: UtilityService) {
    this.network_status = true; // Assumed online until HttpErrorResponse is received.
  }

  public authors: author[] = [];
  public titles: title[] = [];
  public editors: editor[] = [];
  public fragment_names: fragment_name[] = [];
  public fragments: Fragment[] = [];
  public fragment_key: fragment_key = {};

  public author_title_editor_blob: any = [];

  FlaskURL: string = environment.flask_api;
  NeuralURL: 'https://oscc.nolden.biz:5002/';

  public new_fragment_alert = new ReplaySubject(0);
  public new_authors_alert = new ReplaySubject(0);
  public new_titles_alert = new ReplaySubject(0);
  public new_editors_alert = new ReplaySubject(0);

  private new_fragments_alert = new BehaviorSubject<number>(-1);
  public new_fragments_alert$ = this.new_fragments_alert.asObservable();

  private new_fragment_names_alert = new BehaviorSubject<number>(-1);
  public new_fragment_names_alert$ = this.new_fragment_names_alert.asObservable();

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

  public request_authors(): void {
    this.authors = [];
    this.fragment_key = this.create_fragment_key();
    this.get_authors(this.fragment_key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          this.authors.push({ name: value } as author);
        });
        this.new_authors_alert.next(1);
      },
      error: (err) => this.handle_error_message(err),
    });
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

  public request_fragments(column_id: number, author: string, title: string, editor: string, name?: string): void {
    this.spinner_on();
    this.fragments = [];
    this.fragment_key = this.create_fragment_key(author, title, editor);
    if (name) {
      this.fragment_key.name = name;
    }
    this.get_fragments(this.fragment_key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          const fragment = new Fragment();
          fragment.set_fragment(value);
          this.fragments.push(fragment);
        });
        this.new_fragments_alert.next(column_id);
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_create_fragment(fragment: Fragment, column_id?: number): void {
    this.spinner_on();
    this.create_fragment(fragment).subscribe({
      next: (data) => {
        this.handle_error_message(data);
        this.request_authors_titles_editors_blob();
        if (column_id) {
          this.request_fragment_names(column_id, fragment.author, fragment.title, fragment.editor);
          this.request_fragments(column_id, fragment.author, fragment.title, fragment.editor, fragment.name);
        }
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_revise_fragment(fragment: Fragment, column_id?: number): void {
    this.spinner_on();
    this.revise_fragment(fragment).subscribe({
      next: (data) => {
        this.handle_error_message(data);
        this.request_authors_titles_editors_blob();
        if (column_id) {
          this.request_fragment_names(column_id, fragment.author, fragment.title, fragment.editor);
          this.request_fragments(column_id, fragment.author, fragment.title, fragment.editor, fragment.name);
        }
        this.spinner_off();
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  public request_delete_fragment(
    author: string,
    title: string,
    editor: string,
    name: string,
    column_id?: number
  ): void {
    this.spinner_on();
    this.fragment_key = this.create_fragment_key(author, title, editor, name);
    this.delete_fragment(this.fragment_key).subscribe({
      next: (data) => {
        this.handle_error_message(data);
        this.request_authors_titles_editors_blob();
        if (column_id) {
          this.request_fragment_names(column_id, author, title, editor);
        }
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

  /**
   * Requests all authors from the database. No parameters needed
   */
  public request_authors2(column: Column): void {
    this.get_authors(new Fragment({})).subscribe({
      next: (data) => {
        column.retrieved_authors = data;
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  /**
   * Requests the titles by the given author. Result is written
   * to this.retrieved_titles.
   * @param column Fragment_column object with all necessary data
   * @author Ycreak
   */
  public request_titles2(column: Column): void {
    this.get_titles(new Fragment({ author: column.selected_fragment_author })).subscribe({
      next: (data) => {
        column.retrieved_titles = data;
      },
      error: (err) => this.handle_error_message(err),
    });
  }

  /**
   * Requests the editors by the given author and book title. Result is written
   * to this.retrieved_editors.
   * @param column Fragment_column object with all necessary data
   * @author Ycreak
   */
  public request_editors2(column: Column): void {
    this.get_editors(
      new Fragment({ author: column.selected_fragment_author, title: column.selected_fragment_title })
    ).subscribe((data) => {
      column.retrieved_editors = data;
    });
  }

  /**
   * Given the author, title and editor, request the names of the fragments from the server.
   * @param column Fragment_column object with all necessary data
   * @author Ycreak
   */
  public request_fragment_names2(column: Column): void {
    this.get_fragment_names(
      new Fragment({
        author: column.selected_fragment_author,
        title: column.selected_fragment_title,
        editor: column.selected_fragment_editor,
      })
    ).subscribe((data) => {
      column.retrieved_fragment_names = data.sort(this.utility.sort_array_numerically);
    });
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
  public get_authors(fragment: object): Observable<string[]> {
    return this.http.post<string[]>(this.FlaskURL + `fragment/get/author`, fragment, {
      observe: 'body',
      responseType: 'json',
    });
  }
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
  public get_author_introduction_text(column: Column): Observable<string> { // FIXME: Merge these two functions into one?
    return this.http.post<string>(this.FlaskURL + 'get_author_introduction_text', column, {observe: 'body', responseType: 'json' });
  }
  public get_title_introduction_text(column: Column): Observable<string> {
    return this.http.post<string>(this.FlaskURL + 'get_title_introduction_text', column, {observe: 'body', responseType: 'json' });
  }
  public set_author_introduction_text(text: string): Observable<any> { // FIXME: Merge these two functions into one?
    return this.http.post<any>(this.FlaskURL + 'set_author_introduction_text', text, {observe: 'response', responseType: 'text' as 'json'});
  }
  public set_title_introduction_text(text: string): Observable<any> {
    return this.http.post<any>(this.FlaskURL + 'set_title_introduction_text', text, {observe: 'response', responseType: 'text' as 'json'});
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
