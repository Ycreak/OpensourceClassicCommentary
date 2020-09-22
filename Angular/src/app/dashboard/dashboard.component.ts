import { Component, OnInit } from '@angular/core';
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
  // F_Commentary;
  F_Commentary = new Array<Commentary>(); //FIXME: cannot read F_Commentary.id in HTML as it does not exist yet.
  F_Apparatus;
  F_Translation;
  F_Context;
  F_Differences;
  F_ReferencerID;
  F_Reconstruction;
  F_Content;
  F_FragmentLine;

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

  noCommentary: boolean;

  contentForm;
  fragmentForm;

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
        inputFragmentNumber: '', // Horrible naming, should be rethought.
        inputLineNumber: '',
        inputLineContent: '',
        inputLineStatus: '',
      });

     }

  ngOnInit(): void {
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
    console.log('commen', this.F_Commentary)
  }

  public Test(thing){
    console.log('commen', this.F_Commentary)
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

 public RequestCommentaries(referencerID: number){ //FIXME: must be number
  // Check if ReferencerID is valid. If not, no commentary available
  if (Number.isNaN(referencerID)){
    this.noCommentary = true;
  }
  else{
    // Set commentary available
    this.noCommentary = false;
    // Retrieves Fragment Commentary    
    this.api.GetCommentary(referencerID).subscribe(data => this.F_Commentary = data);
    // Retrieves Fragment Differences
    this.api.GetDifferences(referencerID).subscribe(data => this.F_Differences = data);
    // Retrieves Fragment Context
    this.api.GetContext(referencerID).subscribe(data => this.F_Context = data);
    // Retrieves Fragment Translation
    this.api.GetTranslation(referencerID).subscribe(data => this.F_Translation = data);
    // Retrieves Fragment App. Crit.
    this.api.GetApparatus(referencerID).subscribe(data => this.F_Apparatus = data);
    // Retrieves Fragment Reconstruction
    this.api.GetReconstruction(referencerID).subscribe(data => this.F_Reconstruction = data);
  }
  // Turn off spinner at the end
  // this.spinner = false;
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

    // this.api.DeleteAuthor('Job Zwaag').subscribe();
    // this.api.CreateBook(new Book(77, 69, 'Zwarte piet is racistisch')).subscribe();
    // this.api.DeleteBook('Zwarte piet is racistisch').subscribe();
    // this.api.CreateEditor(new Editor(8, 6, 'The best editor', 1)).subscribe();
    // this.api.DeleteEditor('The best editor').subscribe();
    // this.api.SetMainEditorFlag(7, false).subscribe();
    // this.api.CreateFragment(new Fragment(222, 200, 'Best frag', '400-401', 81, 'Classical nonsense', 1, 'ok')).subscribe();
    // this.api.DeleteFragment('8', 6, 5).subscribe();
    // this.api.CreateContext(new Context(88, 3, 'Ugh', 'Some content')).subscribe();
    // this.api.SetPublishFlag(1, 6, 134, false).subscribe();


  public RequestCreateAuthor(authorName: String){
    console.log(authorName);
    // this.api.CreateAuthor(new Author(authorName)).subscribe();

  }

  public  RequestDeleteAuthor(author: number){
    console.log(author);
  }

  public RequestCreateBook(bookName: String, author: number){
    console.log(bookName);
    // this.pushData('createBook')
  }

  public RequestDeleteBook(book: number, author: number){
    console.log(book);
    // this.pushData('deleteBook')
  }

  public RequestCreateEditor(editorName : String, book: number, author: number){
    console.log(editorName);
    // this.pushData('createEditor')
  }

  public RequestDeleteEditor(editor: number, book: number, author: number){
    console.log(editor);
    // this.pushData('deleteEditor')
  }

  public RequestSetMainEditor(editor: number, book: number, author: number){
    console.log(editor);
    // this.pushData('setMainEditor')
  }

  public RequestDeleteMainEditor(editor: number, book: number, author: number){
    console.log(editor);
    // this.pushData('deleteMainEditor')
  }

}
