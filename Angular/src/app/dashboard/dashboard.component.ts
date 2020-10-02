import { Component, OnInit} from '@angular/core';
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { Observable } from 'rxjs';

// To allow the use of forms
import { FormBuilder } from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

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
import { stringify } from '@angular/compiler/src/util';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Inject} from '@angular/core';
// import { resolve } from 'path';

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

  referencer : number = 0;
  serverStatus : number;

  spinner : boolean = false;

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
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
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data); //FIXME: should be requestAuthors
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
    // console.log('list', list);

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
 public RequestReferencerID(fragmentName: string, editor: number, book: number){
  console.log('You called! fragment, editor, book: ', fragmentName, editor, book)
  // Turn on the spinner.
  // this.spinner = true;
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



//   _____  ______ ____  _    _ ______  _____ _______ _____ 
//  |  __ \|  ____/ __ \| |  | |  ____|/ ____|__   __/ ____|
//  | |__) | |__ | |  | | |  | | |__  | (___    | | | (___  
//  |  _  /|  __|| |  | | |  | |  __|  \___ \   | |  \___ \ 
//  | | \ \| |___| |__| | |__| | |____ ____) |  | |  ____) |
//  |_|  \_\______\___\_\\____/|______|_____/   |_| |_____/                                                    

  public RequestReviseContent(form){
    if (form.inputTranslation != ''){
      this.api.CreateTranslation(new Translation(0, this.referencer, form.inputTranslation)).subscribe(
        res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)); //FIXME: dont pass ID. autoincrement
    }
    if (form.inputApparatus != ''){
      this.api.CreateApparatus(new Apparatus(0, this.referencer, form.inputApparatus)).subscribe(
        res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)); //FIXME: dont pass ID. autoincrement
    }
    if (form.inputDifferences != ''){
      this.api.CreateDifferences(new Differences(0, this.referencer, form.inputDifferences)).subscribe(
        res => this.handleErrorMessage(res), err => this.handleErrorMessage(err));
    }
    if (form.inputCommentary != ''){
      this.api.CreateCommentary(new Commentary(0, this.referencer, form.inputCommentary)).subscribe(
        res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)); //FIXME: dont pass ID. autoincrement
    }
    if (form.inputReconstruction != ''){
      this.api.CreateReconstruction(new Reconstruction(0, this.referencer, form.inputReconstruction)).subscribe(
        res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)); //FIXME: dont pass ID. autoincrement
    }
  }

  public RequestReviseContext(form){
    if (form.inputContext != '' || form.inputContextAuthor != ''){
      this.api.CreateContext(new Context(0, this.referencer, form.inputContextAuthor, form.inputContext)).subscribe(
        res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)); //FIXME: dont pass ID. autoincrement
    }
  }

  public RequestPublishFlag(editorID: number, bookID: number, fragmentID: string, flag: number){
    this.api.SetPublishFlag(editorID, bookID, fragmentID, flag).subscribe(
      res => this.handleErrorMessage(res), err => this.handleErrorMessage(err));
  }


  public RequestAuthors(){
    this.api.GetAuthors().subscribe(
      data => this.authorsJSON = data,
      err => this.handleErrorMessage(err),
    );      
  }

  public sortByKey(jsObj){
    var sortedArray = [];

    // Push each JSON Object entry in array by [key, value]
    for(var i in jsObj)
    {
        sortedArray.push([i, jsObj[i]]);
    }

    // Run native sort function and returns sorted array.
    return sortedArray.sort();
}

  public RequestBooks(author: number){
    this.api.GetBooks(author).subscribe(
      data => this.booksJSON = data,
      err => this.handleErrorMessage(err),
    );      
  }

  public RequestEditors(book: number){
    this.api.GetEditors(book).subscribe(
      data => this.editorsJSON = data,
      err => this.handleErrorMessage(err),
    );
  }

  public RequestFragments(book: number){
    this.api.GetFragments(book).subscribe(
      data => this.F_Fragments = data,
      err => this.handleErrorMessage(err),
    );  
  }

  public async RequestCreateAuthor(authorName: string){
    this.openConfirmationDialog('Are you sure you want to CREATE this author?', authorName).subscribe(result => {
      if(result){
        this.api.CreateAuthor(new Author(0, authorName)).subscribe(
          res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
        );
      }
    });//FIXME: Can this be done more elegant?
  }

 
  public RequestDeleteAuthor(author: number){
    this.openConfirmationDialog('Are you sure you want to DELETE this author?', this.selectedAuthor.name).subscribe(result => {
      if(result){
        this.api.DeleteAuthor(author).subscribe(
          res => this.handleErrorMessage(res), err => this.handleErrorMessage(err),
        );  
      }
    });
  }

  public RequestCreateBook(bookName: string, author: number){
    this.openConfirmationDialog('Are you sure you want to CREATE this book?',bookName).subscribe(result => {
      if(result){
        this.api.CreateBook(new Book(0, author, bookName)).subscribe(//FIXME: dont pass ID. autoincrement
          res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
        );  
      }
    });    
  }

  public RequestDeleteBook(book: number, author: number){
    this.openConfirmationDialog('Are you sure you want to DELETE this book?', this.selectedBook.name).subscribe(result => {
      if(result){
        this.api.DeleteBook(book, author).subscribe(
          res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
        );  
      }
    });  
  }

  public RequestCreateEditor(editorName : string, book: number, author: number){
    this.openConfirmationDialog('Are you sure you want to CREATE this editor?', editorName).subscribe(result => {
      if(result){     // Create editor as not being a main editor.
        this.api.CreateEditor(new Editor(0, book, editorName, 0)).subscribe(//FIXME: dont pass ID. autoincrement
          res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
        );  
      }
    });  
  }

  public RequestDeleteEditor(editor: number, book: number, author: number){
    this.openConfirmationDialog('Are you sure you want to DELETE this editor?', this.selectedEditor.name).subscribe(result => {
      if(result){
        this.api.DeleteEditor(editor).subscribe(
          res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
        );  
      }
    });  
  }

  public RequestSetMainEditor(editor: number, book: number, author: number){
    console.log(editor);
    this.api.SetMainEditorFlag(editor, 1).subscribe(
      res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
    );
  }

  public RequestDeleteMainEditor(editor: number, book: number, author: number){
    console.log(editor);
    this.api.SetMainEditorFlag(editor, 0).subscribe(
      res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
    );
  }

  public RequestCreateFragment(form, editor: number, book: number){
    //FIXME: this needs to be an update statement! :D
    // These fields may not be empty! TODO: this needs to be added to the form logic.
    if(form.inputFragmentNumber != '' && form.inputLineNumber != '' && form.inputLineContent != ''){
      this.api.CreateFragment(new Fragment(0, book, editor, form.inputFragmentNumber, form.inputLineNumber, form.inputLineContent, 0, '')).subscribe(
        res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
      );
    }
    else{
      this.openSnackbar('Please fill in all required fields!')
    }
  }

  public RequestDeleteFragment(editor: number, book: number, fragmentname: string){
    console.log(editor, book, fragmentname)  
    this.openConfirmationDialog('Are you sure you want to DELETE this fragment?', fragmentname).subscribe(result => {
      if(result){
        this.api.DeleteFragment(editor, book, fragmentname).subscribe(
          res => this.handleErrorMessage(res), err => this.handleErrorMessage(err)
        );  
      }
    });     
  }

  public openConfirmationDialog(message, item): Observable<boolean>{
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: 'auto',
      data: {
        message: message,
        item: item,
      }
    });  
    return dialogRef.afterClosed(); // Returns observable.
  }

  public openSnackbar(input){
    this._snackBar.open(input, 'Close', {
      duration: 5000,
      panelClass: ['primary'], //FIXME: doesnt work
    });
  }

  //TODO: message handling and outputting to snackbar should be separated in two functions.
  handleErrorMessage(message) { //FIXME: needs renaming of error and message
    console.log(message)
    let output = ''
    
    if(message.statusText == 'OK'){
      output = 'Operation succesful.' 
    }
    else{
      output = 'Something went wrong.'
    }

    output = String(message.status) + ': ' + output + ' ' + message.statusText;

    this.openSnackbar(output); //FIXME: Spaghetti.
  } 
}

  //TODO: change name to something more appropriate.
  @Component({
    selector: 'dialog-overview-example-dialog',
    templateUrl: 'dialog-overview-example-dialog.html',
  })
  export class DialogOverviewExampleDialog {
    constructor(
      public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
      @Inject(MAT_DIALOG_DATA) public data) { }
    onNoClick(): void {
      this.dialogRef.close();
    }
  }


