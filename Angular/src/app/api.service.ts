import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Fragment } from './models/Fragment';
import { Author } from './models/Author';
import { Editor } from './models/Editor';
import { Bibliography } from './models/Bibliography';
import { Context } from './models/Context';
import { Book } from './models/Book';
import { Reconstruction } from './models/Reconstruction';
import { Apparatus } from './models/Apparatus';
import { Translation } from './models/Translation';
import { Differences } from './models/Differences';
import { Commentary } from './models/Commentary';
import { Text } from './models/Text';
import { TextCommentary } from './models/TextCommentary';


import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse,
        } from '@angular/common/http';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/empty';
// import 'rxjs/add/operator/retry'; // don't forget the imports

import { EMPTY, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  // ApiUrl: String = 'http://localhost:5000/';
  ApiUrl: String = 'http://oscc.nolden.biz:5000/'; // For deployment
  // CREA 4
  // FlaskURL: String = 'https://oscc.nolden.biz:5003/'; // For production (http! not https)                                 
  FlaskURL: String = 'http://localhost:5003/'; // For deployment (http! not https)                                 

  NeuralURL: String = 'http://nolden.biz:5002/'; // For deployment (http! not https)                                 


//   _____ ______ _______ 
//   / ____|  ____|__   __|
//  | |  __| |__     | |   
//  | | |_ |  __|    | |   
//  | |__| | |____   | |   
//   \_____|______|  |_|   
                                    
  /**
  * ... ... ...
  * @param bookID
  * @returns
  * @author Ycreak, ppbors
  */
  GetFragments(author: string, book: string, editor: string): Observable<Fragment[]> {
    return this.http.get<Fragment[]>(this.FlaskURL + `fragments?author=${author}&book=${book}&editor=${editor}`);
  }

  /**
  * ... ... ...
  * @param bookID
  * @returns
  * @author Ycreak, ppbors
  */
 Get_specific_fragment(fragment_id: string): Observable<Fragment[]> {
  return this.http.get<Fragment[]>(this.FlaskURL + `completefragment?fragment_id=${fragment_id}`);
}

  /**
  * ... ... ...
  * @returns
  * @author Ycreak, ppbors
  */
  GetAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.FlaskURL + `authors`);
  }

  /**
  * ... ... ...
  * @param authorID
  * @returns
  * @author Ycreak, ppbors
  */
 GetBooks(author: string): Observable<Book[]> {
  return this.http.get<Book[]>(this.FlaskURL + `books?author=${author}`);
}

  /**
  * ... ... ...
  * @param bookID
  * @returns
  * @author Ycreak, ppbors
  */
  GetEditors(author: string, book: string): Observable<Editor[]> {
    return this.http.get<Editor[]>(this.FlaskURL + `editors?author=${author}&book=${book}`);
  }

  /**
  * ... ... ...
  * @param title
  * @returns
  * @author Ycreak, ppbors
  */
  GetBibliography(title: string): Observable<Bibliography[]> {
    return this.http.get<Bibliography[]>(this.FlaskURL + `bibliography?title=${title}`);
  }

  /**
  * ... ... ...
  * @param fragment_id
  * @returns
  * @author Ycreak, ppbors
  */
  GetCommentary(fragment_id: string): Observable<Commentary[]> {
    return this.http.get<Commentary[]>(this.FlaskURL + `fcommentary?fragment_id=${fragment_id}`);
  }

  /**
  * ... ... ...
  * @param fragment_id
  * @returns
  * @author Ycreak, ppbors
  */
  GetDifferences(fragment_id: string): Observable<Differences[]> {
    return this.http.get<Differences[]>(this.FlaskURL + `fdifferences?fragment_id=${fragment_id}`);
  }

  /**
  * ... ... ...
  * @param fragment_id
  * @returns
  * @author Ycreak, ppbors
  */
  GetContext(fragment_id: string): Observable<Context[]> {
    return this.http.get<Context[]>(this.FlaskURL + `fcontext?fragment_id=${fragment_id}`);
  }

  /**
  * ... ... ...
  * @param fragment_id
  * @returns
  * @author Ycreak, ppbors
  */
  GetTranslation(fragment_id: string): Observable<Translation[]> {
    return this.http.get<Translation[]>(this.FlaskURL + `ftranslation?fragment_id=${fragment_id}`);
  }

  /**
  * ... ... ...
  * @param fragment_id
  * @returns
  * @author Ycreak, ppbors
  */
  GetApparatus(fragment_id: string): Observable<Apparatus[]> {
    return this.http.get<Apparatus[]>(this.FlaskURL + `fapparatus?fragment_id=${fragment_id}`); // XD FAP CRIT
  }

  /**
  * ... ... ...
  * @param fragment_id
  * @returns
  * @author Ycreak, ppbors
  */
  GetReconstruction(fragment_id: string): Observable<Reconstruction[]> {
    return this.http.get<Reconstruction[]>(this.FlaskURL + `freconstruction?fragment_id=${fragment_id}`);
  }

  Get_users(): Observable<any> {
    return this.http.get<any>(this.FlaskURL + `retrieve_users`);
  }

  /**
  * ... ... ...
  * @param bookID
  * @returns
  * @author Ycreak, ppbors
  */
  GetText(bookID: number): Observable<Text[]> {
    return this.http.get<Text[]>(this.ApiUrl + `tlines?textID=${bookID}`);
  }

  GetTextCommentary(textID: number, lineNumber: number): Observable<TextCommentary[]> {
    return this.http.get<TextCommentary[]>(this.ApiUrl + `tcommentary?textID=${textID}&lineNumber=${lineNumber}`); //FIXME: needs to be TCommentary
  }

//   _____   ____   _____ _______ 
//  |  __ \ / __ \ / ____|__   __|
//  | |__) | |  | | (___    | |   
//  |  ___/| |  | |\___ \   | |   
//  | |    | |__| |____) |  | |   
//  |_|     \____/|_____/   |_|   

  Create_fragment(fragment: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `create_fragment`, fragment, { observe: 'response', responseType: 'text' as 'json' });
  } 
  Revise_fragment(fragment: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `revise_fragment`, fragment, { observe: 'response', responseType: 'text' as 'json'  });
  }
  Delete_fragment(fragment: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `delete_fragment`, fragment, { observe: 'response', responseType: 'text' as 'json'  });
  }
  Update_fragment_lock(data: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `set_fragment_lock`, data, { observe: 'response', responseType: 'text' as 'json'  });
  }
  Login_user(login: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `login_user`, login, { observe: 'response', responseType: 'text' as 'json'  });
  }
  Create_user(data: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `create_user`, data, { observe: 'response', responseType: 'text' as 'json'  });
  }
  Delete_user(data: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `delete_user`, data, { observe: 'response', responseType: 'text' as 'json'  });
  }
  User_change_password(data: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `change_password`, data, { observe: 'response', responseType: 'text' as 'json'  });
  }
  User_change_role(data: object): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `change_role`, data, { observe: 'response', responseType: 'text' as 'json'  });
  }  
  
   /**
   * ... ... ...
   * @param context
   * @returns ... ... ...
   * @author ppbors
   */
  CreateContext(context: Context): Observable<any> {
    return this.http.post<any>(this.FlaskURL + `fcontext/create`, context, { observe: 'response' });
  }
 
  // Scansion Model
  public async Get_neural_data(book_number: number, line_number: number){
    const data = await this.http.get(
      this.NeuralURL + 'Get_neural_data',{
        params: {
          book_number: book_number.toString(),
          line_number: line_number.toString(),
        }
      })
      .toPromise();
      return data;  
  }
}

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