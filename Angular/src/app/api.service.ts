import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fragment } from './models/Fragment';
import { Author } from './models/Author';
import { Editor } from './models/Editor';
import { Bibliography } from './models/Bibliography';
import { FragmentReferencer } from './models/FragmentReferencer';
import { Context } from './models/Context';
import { Book } from './models/Book';
import { Reconstruction } from './models/Reconstruction';
import { Apparatus } from './models/Apparatus';
import { Translation } from './models/Translation';
import { Differences } from './models/Differences';
import { Commentary } from './models/Commentary';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  ApiUrl: String = 'https://localhost:5001/';

  /*
   *
   * 
   * 
   */

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
   * @param author 
   * @returns ... ... ...
   * @author ppbors
   */
  CreateAuthor(author: Author): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `authors`, author);
  }

  /**
   * ... ... ...
   * @param name
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteAuthor(name: string): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `authors/delete`, new Author(0, name));
  }

  /**
   * ... ... ...
   * @param book
   * @returns ... ... ...
   * @author ppbors
   */
  CreateBook(book: Book): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `books`, book);
  }

  /**
   * ... ... ...
   * @param title
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteBook(title: string): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `books/delete`, new Book(0, 0, title));
  }

  /**
   * ... ... ...
   * @param editor
   * @returns ... ... ...
   * @author ppbors
   */
  CreateEditor(editor: Editor): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `editors`, editor);
  }
  
  /**
   * ... ... ...
   * @param name
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteEditor(name: string): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `editors/delete`, new Editor(0, 0, name, 0));
  }

  /**
   * ... ... ...
   * @param editorID
   * @param flag
   * @returns ... ... ...
   * @author ppbors
   */
  SetMainEditorFlag(editorID: number, flag: boolean): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `editors/setmainflag`, new Editor(editorID, 0, '', flag? 1 : null));
  }

  /**
   * ... ... ...
   * @param fragment
   * @returns ... ... ...
   * @author ppbors
   */
  CreateFragment(fragment: Fragment): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fragments`, fragment);
  }

  /**
   * ... ... ...
   * @param name
   * @param bookID
   * @param editorID
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteFragment(name: string, bookID: number, editorID: number): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fragments/delete`, new Fragment(0, bookID, name, '', editorID, '', 0, ''));
  }

  /**
   * ... ... ...
   * @param referencer
   * @param appCrit
   * @param commentary
   * @param differences
   * @param reconstruction
   * @param translation
   * @returns ... ... ...
   * @author ppbors
   * TODO:FIXME: make call in api
   */
  CreateFragmentCommentary(referencer: string, appCrit: string, commentary: string, differences: string, reconstruction: string, translation: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?referencer=' + referencer + '&appCrit=' + appCrit + '&commentary=' + commentary + '&differences=' + 
                                   differences + '&reconstruction=' + reconstruction + '&translation=' + translation);
  }

   /**
   * ... ... ...
   * @param context
   * @returns ... ... ...
   * @author ppbors
   */
  CreateContext(context: Context): Observable<any> {
    return this.http.post<any>(this.ApiUrl + `fcontext`, context);
  }

   /**
   * ... ... ...
   * @param appCrit
   * @param referencer
   * @param differences
   * @param commentary
   * @param translation
   * @param reconstruction
   * @returns ... ... ...
   * @author ppbors
   * TODO:FIXME: make call in api
   */
  ReviseFragmentCommentary(appCrit: string, referencer: string, differences: string, commentary: string, translation: string, reconstruction: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?appCrit=' + appCrit + '&referencer=' + referencer + '&differences='
                                   + differences + '&commentary=' + commentary + '&translation=' + translation + '&reconstruction=' + reconstruction);
  }

   /**
   * ... ... ...
   * @param context
   * @param referencer
   * @param contextAuthor
   * @returns ... ... ...
   * @author ppbors
   * TODO:FIXME: make call in api
   */
  ReviseFragmentContext(context: string, referencer: string, contextAuthor: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?context=' + context + '&referencer=' + referencer + '&contextAuthor=' + contextAuthor);
  }

   /**
   * ... ... ...
   * @param content
   * @param book
   * @param fragment
   * @param line
   * @returns ... ... ...
   * @author ppbors
   * TODO:FIXME: make call in api
   */
  ReviseFragmentContent(content: string, book: string, fragment: string, line: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?content=' + content + '&book=' + book + '&fragment=' + fragment + '&line=' + line);
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
  SetPublishFlag(editorID: number, bookID: number, fragmentID: number, flag: boolean): Observable<any> {
    return this.http.post<any>(this.ApiUrl + 'fragmentreferencer/setpublishflag', new FragmentReferencer(0, bookID, editorID, fragmentID, flag ? 1 : null));
  }
}
