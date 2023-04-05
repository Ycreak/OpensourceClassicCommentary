// Library imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

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

  constructor(private http: HttpClient, private utility: UtilityService) {
    this.network_status = true; // Assumed online until HttpErrorResponse is received.
  }

  public authors: author[] = [];
  public titles: title[] = [];
  public editors: editor[] = [];
  public fragment_names: fragment_name[] = [];
  public fragments: Fragment[] = [];

  // URL for production
  // FlaskURL: String = 'https://oscc.nolden.biz:5003/'; // For production (https)
  // URL for staging
  FlaskURL: String = 'https://oscc.nolden.biz:5004/'; // For staging (https)
  // URL for development
  // FlaskURL: String = 'http://localhost:5003/'; // For deployment (http! not https)

  // NeuralURL: String = 'http://localhost:5002/';
  NeuralURL: String = 'https://oscc.nolden.biz:5002/';

  public new_fragment_alert = new ReplaySubject(0);
  public new_authors_alert = new ReplaySubject(0);
  public new_titles_alert = new ReplaySubject(0);
  public new_editors_alert = new ReplaySubject(0);
  public new_fragments_alert = new ReplaySubject(0);
  public new_fragment_names_alert = new ReplaySubject(0);

  private create_fragment_key(author?: string, title?: string, editor?: string, name?: string): fragment_key {
    const key: fragment_key = {};
    if (author) { key.author = author };
    if (title) { key.title = title };
    if (editor) { key.editor = editor };
    if (name) { key.name = name };
    return key;
  }

  public request_authors2(): void {
    this.authors = [];
    const key = this.create_fragment_key();
    this.get_authors(key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          this.authors.push({ name: value } as author);
        });
        this.new_authors_alert.next(1);
      },
      error: (err) => this.utility.handle_error_message(err),
    });
  }

  public request_titles2(author: string): void {
    this.titles = [];
    const key = this.create_fragment_key(author = author);
    this.get_titles(key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          this.titles.push({ name: value } as title);
        });
        this.new_titles_alert.next(1);
      },
      error: (err) => this.utility.handle_error_message(err),
    });
  }

  public request_editors2(author: string, title: string): void {
    this.editors = [];
    const key = this.create_fragment_key(author = author, title = title);
    this.get_editors(key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          this.editors.push({ name: value } as editor);
        });
        this.new_editors_alert.next(1);
      },
      error: (err) => this.utility.handle_error_message(err),
    });
  }

  public request_fragment_names2(author: string, title: string, editor: string): void {
    this.fragment_names = [];
    const key = this.create_fragment_key(author = author, title = title, editor = editor);
    this.get_fragment_names(key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          this.fragment_names.push({ name: value } as fragment_name);
        });
        this.new_fragment_names_alert.next(1);
      },
      error: (err) => this.utility.handle_error_message(err),
    });
  }

  public request_fragments(author: string, title: string, editor: string): void {
    this.fragments = [];
    const key = this.create_fragment_key(author = author, title = title, editor = editor);
    this.get_fragments(key).subscribe({
      next: (data) => {
        data.forEach((value) => {
          let fragment = new Fragment();
          fragment.set_fragment(value);
          this.fragments.push(fragment);
        });        
        this.new_fragments_alert.next(1);
      },
      error: (err) => this.utility.handle_error_message(err),
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
  public request_authors(column: Column): void {
    this.utility.spinner_on();
    this.get_authors(new Fragment({})).subscribe({
      next: (data) => {
        column.retrieved_authors = data;
        this.utility.spinner_off();
      },
      error: (err) => this.utility.handle_error_message(err),
    });
  }

  /**
   * Requests the titles by the given author. Result is written
   * to this.retrieved_titles.
   * @param column Fragment_column object with all necessary data
   * @author Ycreak
   */
  public request_titles(column: Column): void {
    this.utility.spinner_on();

    this.get_titles(new Fragment({ author: column.selected_fragment_author })).subscribe({
      next: (data) => {
        column.retrieved_titles = data;
        this.utility.spinner_off();
      },
      error: (err) => this.utility.handle_error_message(err),
    });
  }

  /**
   * Requests the editors by the given author and book title. Result is written
   * to this.retrieved_editors.
   * @param column Fragment_column object with all necessary data
   * @author Ycreak
   */
  public request_editors(column: Column): void {
    this.utility.spinner_on();
    this.get_editors(
      new Fragment({ author: column.selected_fragment_author, title: column.selected_fragment_title })
    ).subscribe((data) => {
      column.retrieved_editors = data;
      this.utility.spinner_off();
    });
  }

  /**
   * Given the author, title and editor, request the names of the fragments from the server.
   * @param column Fragment_column object with all necessary data
   * @author Ycreak
   */
  public request_fragment_names(column: Column): void {
    this.utility.spinner_on();

    this.get_fragment_names(
      new Fragment({
        author: column.selected_fragment_author,
        title: column.selected_fragment_title,
        editor: column.selected_fragment_editor,
      })
    ).subscribe((data) => {
      column.retrieved_fragment_names = data.sort(this.utility.sort_array_numerically);
      this.utility.spinner_off();
    });
  }

  /**
   * Converts the JSON from the server to a Typescript object
   * @author Ycreak
   * @TODO: can this be done automatically without being invoked from fragment.component?
   */
  public convert_fragment_json_to_typescript(data): Fragment[] {
    let fragment_list = [];
    for (let i in data) {
      let fragment = new Fragment();
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
}

// Interceptor for HTTP errors
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private api: ApiService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap({
        next: (res) => {
          this.api.network_status = true; // Set network status to true on successful response
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
