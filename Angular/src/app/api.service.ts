// Library imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UtilityService } from './utility.service';

// Model imports
import { Fragment } from './models/Fragment';
import { Fragment_column } from './models/Fragment_column';

import { Author } from './models/Author';
import { Editor } from './models/Editor';
import { Title } from './models/Title';
import { User } from './models/User';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private utility: UtilityService,
    ) { }

  // URL for production
  // FlaskURL: String = 'https://oscc.nolden.biz:5003/'; // For production (https)                                 
  // URL for staging
  // FlaskURL: String = 'https://oscc.nolden.biz:5004/'; // For production (https)                                 
  // URL for development
  FlaskURL: String = 'http://localhost:5003/'; // For deployment (http! not https)                                 

  /**
   * Requests all authors from the database. No parameters needed
   */
  public request_authors(column: Fragment_column): void {
    this.get_authors().subscribe({
      next: (data) => column.retrieved_authors = data,
      error: (err) => this.utility.handle_error_message(err)
    });
  }

  /**
   * Requests the titles by the given author. Result is written
   * to this.retrieved_titles.
   * @param author name of the author who's titles are to be retrieved
   * @author Ycreak
   */
   public request_titles(column: Fragment_column): void {    
    this.get_titles(column.author).subscribe(
      data => {
        column.retrieved_titles = data;
      }
    );
  }

  /**
   * Requests the editors by the given author and book title. Result is written
   * to this.retrieved_editors.
   * @param author name of the author who's editors are to be retrieved
   * @param title name of the title who's editors are to be retrieved
   * @author Ycreak
   */
     public request_editors(column: Fragment_column): void {
      this.get_editors(column.author, column.title).subscribe(
        data => {
          column.retrieved_editors = data;
        }
      );
    }

  /**
   * Given the author, title and editor, request the names of the fragments from the server.
   * @param author author of the fragment
   * @param title title of the fragment
   * @param editor editor of the fragment
   * @author Ycreak
   */
   public request_fragment_names(column: Fragment_column): void {
    // Create api/fragment object to send to the server
    let api_data = this.utility.create_empty_fragment();
    api_data.author = column.author; 
    api_data.title = column.title; 
    api_data.editor = column.editor;

    this.get_fragment_names(api_data).subscribe(
      data => {
        column.retrieved_fragment_names = data.sort(this.utility.sort_array_numerically);
      });
  }

//    _____ ______ _______ 
//   / ____|  ____|__   __|
//  | |  __| |__     | |   
//  | | |_ |  __|    | |   
//  | |__| | |____   | |   
//   \_____|______|  |_|                  

  public get_authors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.FlaskURL + `authors`);
  }
  public get_bibliography_authors(): Observable<JSON> {
    return this.http.get<JSON>(this.FlaskURL + `get_bibliography_authors`);
  }
  public get_bibliography_from_author(author): Observable<JSON> {
    return this.http.get<JSON>(this.FlaskURL + `get_bibliography_from_author?author=${author}`);
  }
  public  get_bibliography_from_id(_id): Observable<JSON> {
    return this.http.get<JSON>(this.FlaskURL + `get_bibliography_from_id?_id=${_id}`);
  }
  public get_titles(author: string): Observable<Title[]> {
    return this.http.get<Title[]>(this.FlaskURL + `titles?author=${author}`);
  }
  public get_editors(author: string, title: string): Observable<Editor[]> {
    return this.http.get<Editor[]>(this.FlaskURL + `editors?author=${author}&title=${title}`);
  }
  public get_text(titleID: number): Observable<any[]> {
    return this.http.get<any[]>(this.FlaskURL + `tlines?textID=${titleID}`);
  }
  public get_text_commentary(textID: number, lineNumber: number): Observable<any[]> {
    return this.http.get<any[]>(this.FlaskURL + `tcommentary?textID=${textID}&lineNumber=${lineNumber}`);
  }

//   _____   ____   _____ _______ 
//  |  __ \ / __ \ / ____|__   __|
//  | |__) | |  | | (___    | |   
//  |  ___/| |  | |\___ \   | |   
//  | |    | |__| |____) |  | |   
//  |_|     \____/|_____/   |_|   
  //TODO: what Observable type is a make_response?
  // Fragments
  public get_fragments(fragment: Fragment): Observable<Fragment[]> {
    return this.http.post<Fragment[]>(this.FlaskURL + `fragments`, fragment, { observe: 'body', responseType: 'json'});
  }
  public get_fragment_content(fragment: Fragment): Observable<Fragment> {
    return this.http.post<Fragment>(this.FlaskURL + `fragment_content`, fragment, { observe: 'body', responseType: 'json'});
  }
  public get_specific_fragment(fragment: Fragment): Observable<Fragment> {
    return this.http.post<Fragment>(this.FlaskURL + `complete_fragment`, fragment, { observe: 'body', responseType: 'json'});
  }
  public get_fragment_names(fragment: Fragment): Observable<string[]> {
    return this.http.post<string[]>(this.FlaskURL + `fragments_names`, fragment, { observe: 'body', responseType: 'json'});
  }  
  public create_fragment(fragment: FormGroup): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `create_fragment`, fragment, { observe: 'response', responseType: 'text' as 'json' });
  } 
  public revise_fragment(fragment: FormGroup): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `revise_fragment`, fragment, { observe: 'response', responseType: 'text' as 'json'  });
  }
  public delete_fragment(fragment: FormGroup): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `delete_fragment`, fragment, { observe: 'response', responseType: 'text' as 'json'  });
  }
  public automatic_fragment_linker(fragment: Fragment): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `automatic_fragment_linker`, fragment, { observe: 'response', responseType: 'text' as 'json'  });
  }
  // Users
  public get_users(user: User): Observable<User[]> {
    return this.http.post<User[]>(this.FlaskURL + `retrieve_users`, user, { observe: 'body', responseType: 'json'});
  }
  public login_user(user: User): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `login_user`, user, { observe: 'response', responseType: 'text' as 'json' });
  }
  public create_user(user: User): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `create_user`, user, { observe: 'response', responseType: 'text' as 'json'  });
  }
  public delete_user(user: User): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `delete_user`, user, { observe: 'response', responseType: 'text' as 'json'  });
  }
  public user_change_password(user: User): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `change_password`, user, { observe: 'response', responseType: 'text' as 'json'  });
  }
  public user_change_role(user: User): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `change_role`, user, { observe: 'response', responseType: 'text' as 'json'  });
  }  
  // Bibliography
  public create_bibliography_entry(fragment: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `create_bibliography_entry`, fragment, { observe: 'response', responseType: 'text' as 'json' });
  } 
  public revise_bibliography_entry(fragment: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `revise_bibliography_entry`, fragment, { observe: 'response', responseType: 'text' as 'json'  });
  }
  public delete_bibliography_entry(fragment: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `delete_bibliography_entry`, fragment, { observe: 'response', responseType: 'text' as 'json'  });
  }


}

// Interceptor for HTTP errors
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor { 
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
      })
    );
  }
}