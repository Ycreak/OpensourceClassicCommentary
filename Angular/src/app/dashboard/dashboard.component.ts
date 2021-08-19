// Core system components
import { Component, OnInit} from '@angular/core';
import {Inject} from '@angular/core';
import { Observable } from 'rxjs';

// Service and utility imports
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';

// To allow the use of forms
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

// Mat imports
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

// Model imports to send to the API. 
import { Author } from '../models/Author';
import { Book } from '../models/Book';
import { Editor } from '../models/Editor';
import { Fragment } from '../models/Fragment';
import { Context } from '../models/Context';
import { Translation } from '../models/Translation';
import { Apparatus } from '../models/Apparatus';
import { Differences } from '../models/Differences';
import { Commentary } from '../models/Commentary';
import { Reconstruction } from '../models/Reconstruction';
import { Bibliography } from '../models/Bibliography';

// Third party imports
// NPM Library. Hopefully not soon deprecated
import insertTextAtCursor from 'insert-text-at-cursor';

// npm i angular-onscreen-material-keyboard
import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule } from 'angular-onscreen-material-keyboard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // JSON that contain all retrieved data. Does what it says on the tin. //FIXME: Type
  authorsJSON; 
  editorsJSON; 
  mainEditorsJSON : JSON; 
  booksJSON;
  bibJSON;
  // Data variables holding the corresponding retrieved data. //FIXME: Type
  F_Fragments;
  F_Context;
  F_Commentary;
  F_Apparatus;
  F_Translation;
  F_Differences;
  F_ReferencerID;
  F_Reconstruction;
  // Lists to store temporary data
  selectedEditorArray = [];
  fragmentNumberList = [];
  lineNumberList = [];
  // These variables hold the selected items //FIXME: Type
  selectedBook;
  selectedAuthor;
  selectedEditor;
  selectedFragment;
  selectedLine;
  selectedLineStatus;
  selectedContextContent; 
  selectedContext;
  // Variables to allow creating context //FIXME: Type
  createContext : boolean = false;
  // Fields that allow creating
  inputAuthor : string = '';
  inputBook : string = '';
  inputEditor : string = '';
  // Referencer variable, very important for finding the correct fragment
  referencer : number = 0;
  // Spinner, shown when retrieving data from server // FIXME: not implemented right now.
  spinner : boolean = false;
  // Form used to retrieve new fragment data
  fragmentForm = this.formBuilder.group({
    fragmentNumber: ['', Validators.required],
    lineNumber: ['', Validators.required],
    lineContent: ['', Validators.required],
    lineStatus: [''],
  });
  // Form used to retrieve new content data
  contentForm = this.formBuilder.group({
    commentary: [''],
    differences: [''],
    translation: [''],
    apparatus: [''],
    reconstruction: [''],
  });
  // Form used to retrieve new context data
  contextForm = this.formBuilder.group({
    contextAuthor: ['', Validators.required],
    context: ['', Validators.required],
  });
  // Form used to retrieve new bibliography data
  bibForm = this.formBuilder.group({
    editors: [''],
    author: [''],
    book: [''],
    article: [''],
    journal: [''],
    volume: [''],
    chapterTitle: [''],
    pages: [''],
    place: [''],
    year: [''],
    website: [''],
    url: [''],
    consultDate: [''],
  });
  bibType;

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    ) {}
  /**
   * On Init, we just load the list of authors. From here, selection is started
   */
  ngOnInit(): void {
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data); //FIXME: should be requestAuthors?
  }
  /**
   * Updates a value of a key in the given form
   * @param form what form is to be updated
   * @param key what field is to be updated
   * @param value what value is to be written
   */
  public UpdateForm(form, key, value) {
    this[form].patchValue({[key]: value});
  }
  /**
   * Simple test function, can be used for whatever
   * @param thing item to be printed
   */
  public Test(thing){
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

  /**
   * Returns a sorted list of line numbers from a given fragment 
   * @param fragment fragment who's line numbers have to be retrieved
   * @param array array of fragments from the editor in question.
   */
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
    return list.sort(this.utility.SortNumeric);    
  }
  /**
   * Returns the status of the given fragment
   * @param fragment fragment who's status is requested
   * @param array array of fragments from the editor in question
   */
  public GetFragmentStatus(fragment: string, array){   
    array = array.filter(x => x.fragmentName === fragment);
    let item = array[0]
    console.log('stat', item.status)
    
    return item.status;
  }
  //FIXME: horrible function: maybe just a retrieve from server?
  /**
   * Returns content of a specific fragment line
   * @param line line who's content is requested
   * @param fragment fragment from which the line is part
   * @param array array with the fragments from the selected editor
   */
  public GetFragmentLine(line: number, fragment: string, array){
    // Filter on the given fragment number and the given lineNumber
    array = array.filter(x => x.fragmentName === fragment);
    let item = array[0] // Only one entry can exist, so pick that one.
    let myArray = item.content 
    let myLine = myArray.filter(x => x.lineName === line);
    // Return the found content to be shown on screen
    return myLine[0].lineContent;
  }
  /**
   * Sets the global referencer variable to allow finding content of a fragment
   * @param fragmentName name of the fragment who's content is requested
   * @param editor number of the editor who wrote the fragment
   * @param book number of the book of which the fragment is part
   */
  public RequestReferencerID(fragmentName: string, editor: number, book: number){
  console.log('You called! fragment, editor, book: ', fragmentName, editor, book)
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  this.api.GetReferencerID(fragmentName, editor, book).subscribe(
    data => {
      data.sort(this.utility.SortNumeric); //FIXME: this must support naming schemes like Warmington.
      let referencer = Math.min.apply(Math, data)
      console.log('ref', referencer)
      this.RequestCommentaries(referencer); // The lowest ID is used as a referencer
      this.referencer = referencer; //FIXME: should return?
    });
  }
  /**
   * Fills the global content variables with the content of the selected fragment
   * @param referencerID referencer id used to identify the requested fragment
   */
  public async RequestCommentaries(referencerID: number){
    // Retrieves Fragment Commentary: we have all identifiers, so just get the content.    
    this.api.GetCommentary(referencerID).subscribe(data => {
      this.F_Commentary = data;
      this.UpdateForm('contentForm','commentary', this.RetrieveContentField(data, 'commentary'));
    });
    // Retrieves Fragment Differences
    this.api.GetDifferences(referencerID).subscribe(data => {
      this.F_Differences = data;
      this.UpdateForm('contentForm','differences', this.RetrieveContentField(data, 'differences'));
    });
    // Retrieves Fragment Translation
    this.api.GetTranslation(referencerID).subscribe(data => {
      this.F_Translation = data;
      this.UpdateForm('contentForm','translation', this.RetrieveContentField(data, 'translation'));
    });
    // Retrieves Fragment App. Crit.
    this.api.GetApparatus(referencerID).subscribe(data => {
      this.F_Apparatus = data;
      this.UpdateForm('contentForm','apparatus', this.RetrieveContentField(data, 'apparatus'));
    });
    // Retrieves Fragment Reconstruction
    this.api.GetReconstruction(referencerID).subscribe(data => {
      this.F_Reconstruction = data;
      this.UpdateForm('contentForm','reconstruction', this.RetrieveContentField(data, 'reconstruction'));
    });    
    // Retrieves Fragment Context
    this.api.GetContext(referencerID).subscribe(data => this.F_Context = data);
  }
  /**
   * The content is returned in an object of objects. Only one object exists here,
   * so just take the first one and return that. //FIXME: very unelegant, needs reworking
   * @param obj object from which data is to be retrieved
   * @param key title of field that is to be retrieved
   */
  private RetrieveContentField(obj, key){
    if(this.utility.IsEmptyArray(obj)){
      console.log('empty')
      return ''
    }
    else{
      return obj[0][key];
    }
  }

//   _____  ______ ____  _    _ ______  _____ _______ _____ 
//  |  __ \|  ____/ __ \| |  | |  ____|/ ____|__   __/ ____|
//  | |__) | |__ | |  | | |  | | |__  | (___    | | | (___  
//  |  _  /|  __|| |  | | |  | |  __|  \___ \   | |  \___ \ 
//  | | \ \| |___| |__| | |__| | |____ ____) |  | |  ____) |
//  |_|  \_\______\___\_\\____/|______|_____/   |_| |_____/                                                    

  /**
   * Requests all authors from the database. No parameters needed
   */
  public RequestAuthors(){
    this.api.GetAuthors().subscribe(
      data => this.authorsJSON = data,
      err => this.utility.HandleErrorMessage(err),
    );      
  }
  /**
   * Requests all books from a given author
   * @param author number of author who's books are requested
   */
  public RequestBooks(author: number){
    this.api.GetBooks(author).subscribe(
      data => this.booksJSON = data,
      err => this.utility.HandleErrorMessage(err),
    );      
  }
  /**
   * Requests all editors from a given book
   * @param book number of book who's editors are requested
   */
  public RequestEditors(book: number){
    this.api.GetEditors(book).subscribe(
      data => this.editorsJSON = data,
      err => this.utility.HandleErrorMessage(err),
    );
  }
  /**
   * Requests all fragments from a given book
   * @param book number of book who's fragments are requested
   */
  public RequestFragments(book: number){
    this.api.GetFragments(book).subscribe(
      data => this.F_Fragments = data,
      err => this.utility.HandleErrorMessage(err),
    );  
  }

//   _____   ____   _____ _______ 
//  |  __ \ / __ \ / ____|__   __|
//  | |__) | |  | | (___    | |   
//  |  ___/| |  | |\___ \   | |   
//  | |    | |__| |____) |  | |   
//  |_|     \____/|_____/   |_|   
                         
  /**
   * Pushes the content form to the database via the api
   * @param form content form from the dashboard
   */
  public RequestReviseContent(form){
    //FIXME: dont just push everything to the database.
    this.api.CreateTranslation(new Translation(0, this.referencer, form.translation)).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)); 

    this.api.CreateApparatus(new Apparatus(0, this.referencer, form.apparatus)).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)); 

    this.api.CreateDifferences(new Differences(0, this.referencer, form.differences)).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err));

    this.api.CreateCommentary(new Commentary(0, this.referencer, form.commentary)).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)); 

    this.api.CreateReconstruction(new Reconstruction(0, this.referencer, form.reconstruction)).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)); 
  }
  /**
   * Pushes the bibliography form to the database via the api
   * @param form bibliography form from the dashboard
   */
  RequestReviseBib(form){
    this.api.CreateBibliography(new Bibliography(0, this.selectedBook,
      form.editors, form.author, form.book, form.article, form.journal,
      form.volume, form.chapterTitle, form.pages, form.place, form.year,
      form.website, form.url, form.consultDate)).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err));
  }
  /**
   * Pushes a new context form to the database via the api
   * @param form context form from the dashboard
   */
  public RequestCreateContext(form){
    this.api.CreateContext(new Context(0, this.referencer, form.contextAuthor, form.context)).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err));
  }
  /**
   * Pushes a revised context form to the database via the api
   * The distinction with RequestCreateContext allows multiple 
   * contexts to exists for a single fragment
   * @param form context form from the dashboard
   */
  public RequestReviseContext(form){
    this.api.CreateContext(new Context(this.selectedContext, this.referencer, form.contextAuthor, form.context)).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err));
  }
  /**
   * Pushes the publish flag to the database for the given parameters
   * @param editorID which editor the fragment belongs to
   * @param bookID what book the fragment belongs to
   * @param fragmentID what fragment should be published
   * @param flag what flag should be set
   */
  public RequestPublishFlag(editorID: number, bookID: number, fragmentID: string, flag: number){
    this.api.SetPublishFlag(editorID, bookID, fragmentID, flag).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err));
  }
  /**
   * Creates the given author via the api
   * @param authorName name of author to be created
   */
  public RequestCreateAuthor(authorName: string){
    this.OpenConfirmationDialog('Are you sure you want to CREATE this author?', authorName).subscribe(result => {
      if(result){
        this.api.CreateAuthor(new Author(0, authorName)).subscribe(
          res => {
            this.utility.HandleErrorMessage(res),
            this.RequestAuthors()
           },
          err => this.utility.HandleErrorMessage(err),
        );
      }
    });
  }
  /**
   * Deletes the in the dashboard selected author
   * @param author number of selected author
   */
  public RequestDeleteAuthor(author: number){
    this.OpenConfirmationDialog('Are you sure you want to DELETE this author?', this.selectedAuthor.name).subscribe(result => {
      if(result){
        this.api.DeleteAuthor(author).subscribe(
          res => {
            this.utility.HandleErrorMessage(res),
            this.RequestAuthors()
           },
          err => this.utility.HandleErrorMessage(err),
        );  
      }
    });
  }
  /**
   * Creates the given book via the api
   * @param bookName name of book to be created
   * @param author number of the author of the book
   */
  public RequestCreateBook(bookName: string, author: number){
    this.OpenConfirmationDialog('Are you sure you want to CREATE this book?',bookName).subscribe(result => {
      if(result){
        this.api.CreateBook(new Book(0, author, bookName)).subscribe(//FIXME: dont pass ID. autoincrement
          res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
        );  
      }
    });    
  }
  /**
   * Deletes the in the dashboard selected book
   * @param book number of selected book
   * @param author number of the author of the book
   */
  public RequestDeleteBook(book: number, author: number){
    this.OpenConfirmationDialog('Are you sure you want to DELETE this book?', this.selectedBook.name).subscribe(result => {
      if(result){
        this.api.DeleteBook(book, author).subscribe(
          res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
        );  
      }
    });  
  }
  /**
   * Creates the given editor via the api
   * @param editorName name of author to be created
   * @param book number of selected book
   * @param author number of the author of the book
   */
  public RequestCreateEditor(editorName : string, book: number, author: number){
    this.OpenConfirmationDialog('Are you sure you want to CREATE this editor?', editorName).subscribe(result => {
      if(result){     // Create editor as not being a main editor.
        this.api.CreateEditor(new Editor(0, book, editorName, 0)).subscribe(//FIXME: dont pass ID. autoincrement
          res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
        );  
      }
    });  
  }
  /**
   * Deletes the in the dashboard selected editor
   * @param editor number of selected editor
   * @param book number of selected book
   * @param author number of the author of the book
   */
  public RequestDeleteEditor(editor: number, book: number, author: number){
    this.OpenConfirmationDialog('Are you sure you want to DELETE this editor?', this.selectedEditor.name).subscribe(result => {
      if(result){
        this.api.DeleteEditor(editor).subscribe(
          res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
        );  
      }
    });  
  }
  /**
   * Sets the selected editor as a main editor
   * @param editor number of selected editor
   * @param book number of selected book
   * @param author number of the author of the book
   */
  public RequestSetMainEditor(editor: number, book: number, author: number){
    this.api.SetMainEditorFlag(editor, 1).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
    );
  }
  /**
   * Deletes the selected editor as a main editor
   * @param editor number of selected editor
   * @param book number of selected book
   * @param author number of the author of the book
   */
  public RequestDeleteMainEditor(editor: number, book: number, author: number){
    this.api.SetMainEditorFlag(editor, 0).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
    );
  }
  /**
   * Creates the fragment as given to the dashboard
   * @param form stores all the fragment data
   * @param editor number of the selected editor
   * @param book number of the selected book
   */
  public RequestCreateFragment(form, editor: number, book: number){  
    this.api.CreateFragment(new Fragment(0, book, editor, form.fragmentNumber, form.lineNumber, form.lineContent, 0, '')).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
    );
  }
  /**
   * Deletes the selected fragment via the api
   * @param editor number of the selected editor
   * @param book number of the selected book
   * @param fragmentname name of the selected fragment
   */
  public RequestDeleteFragment(editor: number, book: number, fragmentname: string){
    console.log(editor, book, fragmentname)  
    this.OpenConfirmationDialog('Are you sure you want to DELETE this fragment?', fragmentname).subscribe(result => {
      if(result){
        this.api.DeleteFragment(editor, book, fragmentname).subscribe(
          res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
        );  
      }
    });     
  }



//   _    _ _______ __  __ _      
//  | |  | |__   __|  \/  | |     
//  | |__| |  | |  | \  / | |     
//  |  __  |  | |  | |\/| | |     
//  | |  | |  | |  | |  | | |____ 
//  |_|  |_|  |_|  |_|  |_|______|
                               
  /**
   * Opens a confirmation dialog with the provided message
   * @param message shows text about what is happening
   * @param item the item that is about to change
   */
  public OpenConfirmationDialog(message, item): Observable<boolean>{
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: 'auto',
      data: {
        message: message,
        item: item,
      }
    });  
    return dialogRef.afterClosed(); // Returns observable.
  }


}

  /**
   * Class to show a confirmation dialog when needed. 
   * Shows whatever data is given
   */
  @Component({
    selector: 'confirmation-dialog',
    templateUrl: 'confirmation-dialog.html',
  })
  export class ConfirmationDialog {
    constructor(
      public dialogRef: MatDialogRef<ConfirmationDialog>,
      @Inject(MAT_DIALOG_DATA) public data) { }
    onNoClick(): void {
      this.dialogRef.close();
    }
  }


