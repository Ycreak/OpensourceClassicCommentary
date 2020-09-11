import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  ApiUrl: String = 'http://localhost:5001/';

  /*
   *
   * 
   * 
   */

  /**
  * ... ... ...
  * @param fragment
  * @param editorId
  * @param book
  * @returns
  * @author Ycreak, ppbors
  * TODO:FIXME: Parameters doorgeven kan op verschillende manieren. Ik vind deze het mooist.
  */
  GetReferencerID(fragment: string, editor: string, book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + `...?fragment=${fragment}&editor=${editor}&book=${book}`);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetFragments(book: string): Observable<string[]>{
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @returns
  * @author Ycreak, ppbors
  */
  GetAuthors(): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...');
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetEditors(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetBibliography(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetCommentary(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetDifferences(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetContext(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetTranslation(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetAppCrit(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetReconstruction(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
  * ... ... ...
  * @param book
  * @returns
  * @author Ycreak, ppbors
  */
  GetBooks(author: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?author=' + author);
  }

  /**
   * ... ... ...
   * @param author 
   * @returns ... ... ...
   * @author ppbors
   */
  CreateAuthor(author: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?author=' + author);
  }

  /**
   * ... ... ...
   * @param author 
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteAuthor(author: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?author=' + author);
  }

  /**
   * ... ... ...
   * @param author
   * @param title
   * @returns ... ... ...
   * @author ppbors
   */
  CreateBook(author: string, title: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?author=' + author + '&title=' + title);
  }

  /**
   * ... ... ...
   * @param book
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteBook(book: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book);
  }

  /**
   * ... ... ...
   * @param book 
   * @param editorName
   * @returns ... ... ...
   * @author ppbors
   */
  CreateEditor(book: string, editor: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book + '&editor=' + editor);
  }
  
  /**
   * ... ... ...
   * @param editorName
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteEditor(editor: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?editor=' + editor);
  }

  /**
   * ... ... ...
   * @param editor
   * @returns ... ... ...
   * @author ppbors
   */
  SetMainEditor(editor: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?editor=' + editor);
  }

  /**
   * ... ... ...
   * @param editor
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteMainEditor(editor: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?editor=' + editor);
  }

  /**
   * ... ... ...
   * @param author
   * @param fragment
   * @param line
   * @param editor
   * @param content
   * @param status
   * @returns ... ... ...
   * @author ppbors
   */
  CreateFragment(book: string, fragment: string, line: string, editor: string, content: string, status: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?book=' + book + '&fragment=' + fragment + '&line=' + 
                                   line + '&editor=' + editor + '&content=' + content + '&status=' + status);
  }

  /**
   * ... ... ...
   * @param fragment
   * @param book
   * @param editor
   * @returns ... ... ...
   * @author ppbors
   */
  DeleteFragment(fragment: string, book: string, editor: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?fragment=' + fragment + '&book=' + book + '&editor=' + editor);
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
   */
  CreateFragmentCommentary(referencer: string, appCrit: string, commentary: string, differences: string, reconstruction: string, translation: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?referencer=' + referencer + '&appCrit=' + appCrit + '&commentary=' + commentary + '&differences=' + 
                                   differences + '&reconstruction=' + reconstruction + '&translation=' + translation);
  }

   /**
   * ... ... ...
   * @param referencer
   * @param author
   * @param context
   * @returns ... ... ...
   * @author ppbors
   */
  CreateContext(referencer: string, author: string, context: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?referencer=' + referencer + '&author=' + author + '&context=' + context);
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
   */
  ReviseFragmentContent(content: string, book: string, fragment: string, line: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?content=' + content + '&book=' + book + '&fragment=' + fragment + '&line=' + line);
  }

  /**
   * ... ... ...
   * @param editor
   * @param book
   * @param fragment
   * @returns ... ... ...
   * @author ppbors
   */
  PublishFragment(editor: string, book: string, fragment: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?editor=' + editor + '&book=' + book + '&fragment' + fragment);
  }

  /**
   * ... ... ...
   * @param editor
   * @param book
   * @param fragment
   * @returns ... ... ...
   * @author ppbors
   */
  UnpublishFragment(editor: string, book: string, fragment: string): Observable<string[]> {
    return this.http.get<string[]>(this.ApiUrl + '...?editor=' + editor + '&book=' + book + '&fragment=' + fragment);
  }
}
