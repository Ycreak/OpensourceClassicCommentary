import { Component, OnInit, ɵConsole } from '@angular/core';
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';

// To allow the use of forms
import { FormBuilder } from '@angular/forms';

import { Author } from '../models/Author';
import { Book } from '../models/Book';
import { Editor } from '../models/Editor';
import { Fragment } from '../models/Fragment';
import { Context } from '../models/Context';
import { Commentary } from '../models/Commentary';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  authorsJSON; // JSON that contains all available Authors and their data.
  editorsJSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON; // JSON that contains all available Bibliography data given a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments;
  F_Context; // Context object, dissected in the dashboard itself (multiple can exist).
  F_Commentary;
  F_Apparatus;
  F_Translation;
  F_Differences;
  F_ReferencerID;
  F_Reconstruction;
  // All the content strings used in the dashboard
  commentaryContent: string = '';
  apparatusContent: string = '';
  translationContent: string = '';
  contextContent: string = '';
  differencesContent: string = '';
  reconstructionContent: string = '';
  contentContent: string = '';
  fragmentLineContent: string = '';

  // DEPRECATED
  currentAuthor: number;
  currentBook: number;
  currentEditor: number;
  currentFragment: number;
  currentLine: number;

  selectedEditorArray = [];
  fragmentNumberList = [];
  lineNumberList = [];

  selectedBook;
  selectedAuthor;
  selectedEditor;
  selectedFragment;
  selectedLine;
  selectedLineStatus;
  selectedContextContent; 

  noCommentary: boolean;

  inputContext;
  inputContextAuthor;

  contentForm;
  fragmentForm;
  contextForm;

  inputAuthor = '';
  inputBook = '';
  inputEditor = '';

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    private formBuilder: FormBuilder,
    ) {
      // Form to revise the commentary of a fragment.
      this.contentForm = this.formBuilder.group({
        inputCommentary: '',
        inputDifferences: '',
        inputContext: '',
        inputTranslation: '',
        inputApparatus: '',
        inputReconstruction: '',
        inputContent: '',
      });
      // Form to create/revise a fragment.
      this.fragmentForm = this.formBuilder.group({
        inputFragmentNumber: '',
        inputLineNumber: '',
        inputLineContent: '',
        inputLineStatus: '',
      });
      // Form to create/revise context
      this.contextForm = this.formBuilder.group({
        inputContext: '',
        inputContextAuthor: '',
      })

     }

  ngOnInit(): void {
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
    // console.log('commen', this.F_Commentary)
  }

  public Test(thing){
    // console.log('commen', this.F_Commentary)
    console.log('test', thing)
  }

  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  public CreateEditorArray(editor: number, array){
    // console.log('CreateEditorArray', editor)
    // Filter the given array on the given editor.
    let tempArray = array.filter(x => x.editor == editor);
    // Sort the lines numerically.
    tempArray.sort(this.utility.SortArrayNumerically);
    // Merge the different lines into their corresponding fragments
    return this.utility.MergeLinesIntoFragment(tempArray);
    // return tempArray;
  }

  public GetFragmentNumbers(editor: number, array){
    // Initialise list
    let list = [];
    // Push all fragment numbers to a list
    for(let key in array){      
      list.push(array[key].fragmentName);
    } 
    // Only take the unique values from this list
    list = this.utility.uniq(list);
    // Sort list numerically
    return list.sort(this.utility.SortNumeric);    
  }

  public GetLineNumbers(fragment: string, array){
    // Filter on fragment number
    array = array.filter(x => x.fragmentName === fragment);
    // Initialise list
    let list = [];
    // Push all fragment numbers to a list
    for(let key in array){      
      for(let line in array[key].content){
        list.push(array[key].content[line].lineName);
      }
    } 
    // Sort list numerically
    console.log('list', list);

    return list.sort(this.utility.SortNumeric);    
  }

  public GetFragmentLine(line: number, fragment: string, array){
    // Filter on the given fragment number and the given lineNumber
    array = array.filter(x => x.fragmentName === fragment);
    
    //FIXME: Very dirty hack, should be at a better place.
    this.selectedLineStatus = array[0].status;

    array = array[0].content // Only one entry can exist, so pick that one.
    array = array.filter(x => x.lineName === line);
    
    // Return the found content to be shown on screen
    return array[0].lineContent;
  }

  /**
  * Retrieves commentaries when a fragment is clicked.
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
 public RequestReferencerID(fragment: string, editor: number, book: number){
  console.log('fragment, editor, book: ', fragment, editor, book)
  // Turn on the spinner.
  // this.spinner = true;
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  this.api.GetReferencerID(fragment, editor, book).subscribe(
    data => {
      let F_ReferencerID = data;
      console.log(F_ReferencerID[0])
      this.RequestCommentaries(Number(F_ReferencerID[0]))// FIXME: not very elegant
    });
 }

 public async RequestCommentaries(referencerID: number){ //FIXME: must be number
  // Check if ReferencerID is valid. If not, no commentary available
  if (Number.isNaN(referencerID)){
    this.noCommentary = true;
  }
  else{
    // Set commentary available
    this.noCommentary = false;
    // Retrieves Fragment Commentary: we have all identifiers, so just get the content.    
    this.api.GetCommentary(referencerID).subscribe(data => {
      this.F_Commentary = data;
      this.commentaryContent = this.RetrieveContentField(data, 'commentary');
    });
    // Retrieves Fragment Differences
    this.api.GetDifferences(referencerID).subscribe(data => {
      this.F_Differences = data;
      this.differencesContent = this.RetrieveContentField(data, 'differences');
    });
    // Retrieves Fragment Translation
    this.api.GetTranslation(referencerID).subscribe(data => {
      this.F_Translation = data;
      this.translationContent = this.RetrieveContentField(data, 'translation');
    });
    // Retrieves Fragment App. Crit.
    this.api.GetApparatus(referencerID).subscribe(data => {
      this.F_Apparatus = data;
      this.apparatusContent = this.RetrieveContentField(data, 'apparatus');
    });
    // Retrieves Fragment Reconstruction
    this.api.GetReconstruction(referencerID).subscribe(data => {
      this.F_Reconstruction = data;
      this.reconstructionContent = this.RetrieveContentField(data, 'reconstruction');
    });    
    // Retrieves Fragment Context
    this.api.GetContext(referencerID).subscribe(data => this.F_Context = data);
  }
  // Turn off spinner at the end
  // this.spinner = false;
}

  private RetrieveContentField(obj, key){
    if(this.utility.IsEmptyArray(obj)){
      console.log('empty')
      return ''
    }
    else{
      return obj[0][key];
    }
  }

  public SelectCorrespondingContext(context){
    console.log(context)
    this.selectedContextContent = context.id;
    this.inputContext = context.context;
    this.inputContextAuthor = context.contextAuthor;
  }

  // REQUEST FUNCTIONS
  public RequestBooks(author: number){
    this.api.GetBooks(author).subscribe(
      data => {
        this.booksJSON = data;
        console.log(data);
      }
    );      
  }

  public RequestEditors(book: number){
    this.api.GetEditors(book).subscribe(
      data => {
        // Set the editorsJSON to contain the retrieved data.
        this.editorsJSON = data;
      }
    );
  }

  public RequestFragments(book: number){
    this.api.GetFragments(book).subscribe(
      data => {
        this.F_Fragments = data;
      }
    );  
  }
    
    // this.api.CreateContext(new Context(88, 3, 'Ugh', 'Some content')).subscribe();
    // this.api.SetPublishFlag(1, 6, 134, false).subscribe();


  public RequestCreateAuthor(authorName: string){
    console.log(authorName);
    this.api.CreateAuthor(new Author(0, authorName)).subscribe(); //FIXME: dont pass ID. autoincrement

  }

  public RequestDeleteAuthor(author: number){
    console.log(author);
    this.api.DeleteAuthor(author).subscribe();
  }

  public RequestCreateBook(bookName: string, author: number){
    console.log(bookName);
    this.api.CreateBook(new Book(0, author, bookName)).subscribe(); //FIXME: dont pass ID. autoincrement
  }

  public RequestDeleteBook(book: number, author: number){
    console.log(book);
    this.api.DeleteBook(book, author).subscribe();
  }

  public RequestCreateEditor(editorName : string, book: number, author: number){
    console.log(editorName);
    // Create editor as not being a main editor.
    this.api.CreateEditor(new Editor(0, book, editorName, 0)).subscribe(); //FIXME: dont pass ID. autoincrement
  }

  public RequestDeleteEditor(editor: number, book: number, author: number){
    console.log(editor);
    this.api.DeleteEditor(editor).subscribe();
  }

  public RequestSetMainEditor(editor: number, book: number, author: number){
    console.log(editor);
    this.api.SetMainEditorFlag(editor, 1).subscribe();
    // this.pushData('setMainEditor')
  }

  public RequestDeleteMainEditor(editor: number, book: number, author: number){
    console.log(editor);
    this.api.SetMainEditorFlag(editor, 0).subscribe();
  }

  public RequestCreateFragment(formInput, editor: number, book: number){
    //FIXME: this needs to be an update statement! :D
    
    this.api.CreateFragment(new Fragment(0, book, editor, formInput.inputFragmentNumber, formInput.inputLineNumber, formInput.inputLineContent, 0, '')).subscribe();

  }

  public RequestDeleteFragment(editor: number, book: number, fragmentname: string){
    console.log(editor, book, fragmentname)  
    this.api.DeleteFragment(editor, book, fragmentname).subscribe();

  }

}
