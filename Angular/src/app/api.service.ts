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
  ApiUrl: String = 'http://katwijk.nolden.biz:5000/'; // For deployment (http! not https)


//   _____ ______ _______ 
//   / ____|  ____|__   __|
//  | |  __| |__     | |   
//  | | |_ |  __|    | |   
//  | |__| | |____   | |   
//   \_____|______|  |_|   
                                    
  /**
  * ... ... ...
  * @param fragmentID
  * @param editorID
  * @param bookID
  * @returns
  * @author Ycreak, ppbors
  */
  GetReferencerID(fragmentName: string, editorID: number, bookID: number): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + `fragments/hello?fragmentID=${fragmentName}&editorID=${editorID}&bookID=${bookID}`);
  }

  /**
  * ... ... ...
  * @param bookID
  * @returns
  * @author Ycreak, ppbors
  */
  GetFragments(bookID: number): Observable<Fragment[]> {
    return this.http.get<Fragment[]>(this.ApiUrl + `fragments?bookID=${bookID}`);
  }

  /**
  * ... ... ...
  * @returns
  * @author Ycreak, ppbors
  */
  GetAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.ApiUrl + `authors`);
  }

  /**
  * ... ... ...
  * @param bookID
  * @returns
  * @author Ycreak, ppbors
  */
  GetEditors(bookID: number): Observable<Editor[]> {
    return this.http.get<Editor[]>(this.ApiUrl + `editors?bookID=${bookID}`);
  }

  /**
  * ... ... ...
  * @param title
  * @returns
  * @author Ycreak, ppbors
  */
  GetBibliography(title: string): Observable<Bibliography[]> {
    return this.http.get<Bibliography[]>(this.ApiUrl + `bibliography?title=${title}`);
  }

  /**
  * ... ... ...
  * @param fragmentID
  * @returns
  * @author Ycreak, ppbors
  */
  GetCommentary(fragmentID: number): Observable<Commentary[]> {
    return this.http.get<Commentary[]>(this.ApiUrl + `fcommentary?fragmentID=${fragmentID}`);
  }

  /**
  * ... ... ...
  * @param fragmentID
  * @returns
  * @author Ycreak, ppbors
  */
  GetDifferences(fragmentID: number): Observable<Differences[]> {
    return this.http.get<Differences[]>(this.ApiUrl + `fdifferences?fragmentID=${fragmentID}`);
  }

  /**
  * ... ... ...
  * @param fragmentID
  * @returns
  * @author Ycreak, ppbors
  */
  GetContext(fragmentID: number): Observable<Context[]> {
    return this.http.get<Context[]>(this.ApiUrl + `fcontext?fragmentID=${fragmentID}`);
  }

  /**
  * ... ... ...
  * @param fragmentID
  * @returns
  * @author Ycreak, ppbors
  */
  GetTranslation(fragmentID: number): Observable<Translation[]> {
    return this.http.get<Translation[]>(this.ApiUrl + `ftranslations?fragmentID=${fragmentID}`);
  }

  /**
  * ... ... ...
  * @param fragmentID
  * @returns
  * @author Ycreak, ppbors
  */
  GetApparatus(fragmentID: number): Observable<Apparatus[]> {
    return this.http.get<Apparatus[]>(this.ApiUrl + `fapparatus?fragmentID=${fragmentID}`); // XD FAP CRIT
  }

  /**
  * ... ... ...
  * @param fragmentID
  * @returns
  * @author Ycreak, ppbors
  */
  GetReconstruction(fragmentID: number): Observable<Reconstruction[]> {
    return this.http.get<Reconstruction[]>(this.ApiUrl + `freconstruction?fragmentID=${fragmentID}`);
  }

  /**
  * ... ... ...
  * @param authorID
  * @returns
  * @author Ycreak, ppbors
  */
  GetBooks(authorID: number): Observable<Book[]> {
    return this.http.get<Book[]>(this.ApiUrl + `books?authorID=${authorID}`);
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

  /**
   * ... ... ...
   * @param author 
   * @returns ... ... ...
   * @author ppbors
   */
  CreateAuthor(author: Author): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `authors`, author, { observe: 'response' })
  }

  /**
   * ... ... ...
   * @param name
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteAuthor(id: number): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `authors/delete`, new Author(id, ''), { observe: 'response' })
  }

  /**
   * ... ... ...
   * @param book
   * @returns ... ... ...
   * @author ppbors
   */
  CreateBook(book: Book): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `books`, book, { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param title
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteBook(id: number, author: number): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `books/delete`, new Book(id, author, ''), { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param editor
   * @returns ... ... ...
   * @author ppbors
   */
  CreateEditor(editor: Editor): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `editors`, editor, { observe: 'response' });
  }
  
  /**
   * ... ... ...
   * @param name
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteEditor(id: number): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `editors/delete`, new Editor(id, 0, '', 0), { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param editorID
   * @param flag
   * @returns ... ... ...
   * @author ppbors
   */
  SetMainEditorFlag(editorID: number, flag: number): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `editors/setmainflag`, new Editor(editorID, 0, '', flag? 1 : null), { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param fragment
   * @returns ... ... ...
   * @author ppbors
   */
  CreateFragment(fragment: Fragment): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fragments`, fragment, { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param name
   * @param bookID
   * @param editorID
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteFragment(editorID: number, bookID: number, fragmentname: string): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fragments/delete`, new Fragment(0, bookID, editorID, fragmentname, '', '', 0, ''), { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param translation
   * @returns ... ... ...
   * @author ppbors
   */
  CreateTranslation(translation: Translation): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `ftranslations/create`, translation, { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param apparatus
   * @returns ... ... ...
   * @author ppbors
   */
  CreateApparatus(apparatus: Apparatus): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fapparatus/create`, apparatus, { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param differences
   * @returns ... ... ...
   * @author ppbors
   */
  CreateDifferences(differences: Differences): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fdifferences/create`, differences, { observe: 'response' });
  }
  
  /**
   * ... ... ...
   * @param commentary
   * @returns ... ... ...
   * @author ppbors
   */
  CreateCommentary(commentary: Commentary): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fcommentary/create`, commentary, { observe: 'response' });
  }
  
  /**
   * ... ... ...
   * @param reconstruction
   * @returns ... ... ...
   * @author ppbors
   */
  CreateReconstruction(reconstruction: Reconstruction): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `freconstruction/create`, reconstruction, { observe: 'response' });
  }  

   /**
   * ... ... ...
   * @param context
   * @returns ... ... ...
   * @author ppbors
   */
  CreateContext(context: Context): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fcontext/create`, context, { observe: 'response' });
  }

  /**
   * ... ... ...
   * @param editorID
   * @param bookID
   * @param fragmentID
   * @param flag
   * @returns ... ... ...
   * @author ppbors
   */
  SetPublishFlag(editorID: number, bookID: number, fragmentID: string, flag: number): Observable<any> {
    return this.http.post<any>(this.ApiUrl + 'fragmentreferencer/setpublishflag', new Fragment(0, bookID, editorID, fragmentID, '', '', flag, ''), { observe: 'response' });
  }


}

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor { 
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // if (error.error instanceof Error) {
        //   // A client-side or network error occurred. Handle it accordingly.
        //   console.error('An error occurred:', error.error.message);
        // } else {
        //   // The backend returned an unsuccessful response code.
        //   // The response body may contain clues as to what went wrong,
        //   // console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
        // }

        // If you want to return a new response:
        // return of(new HttpResponse({body: [{name: "Default value..."}]}));

        // If you want to return the error on the upper level:
        return throwError(error);


      })
    );
  }
}