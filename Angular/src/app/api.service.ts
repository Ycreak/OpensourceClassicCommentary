// Library imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Model imports
import { Fragment } from './models/Fragment';
import { Author } from './models/Author';
import { Editor } from './models/Editor';
import { Title } from './models/Title';
import { User } from './models/User';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  // FlaskURL: String = 'https://oscc.nolden.biz:5003/'; // For production (https)                                 
  FlaskURL: String = 'http://localhost:5003/'; // For deployment (http! not https)                                 

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
  public login_user(user: User): Observable<User> {
    return this.http.post<User>(this.FlaskURL + `login_user`, user, { observe: 'body', responseType: 'json'});
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