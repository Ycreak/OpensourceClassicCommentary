import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
// import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';

import {ThemePalette} from '@angular/material/core';
// import {FormControl, FormGroupDirective, FormGroup, NgForm, Validators} from '@angular/forms';
import { TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import {ProfileComponent} from '../profile/profile.component'


import 'hammerjs';
// import { Profile } from 'selenium-webdriver/firefox';

export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}


// // Imports navbar from file Navbar
// @Component({
//   selector: 'app-navbar',
//   // templateUrl: './header.html',
//   // styleUrls: ['./fragments.component.css'],
// })
// export class DeviceComponent {}

@Component({
  selector: 'app-interface',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  @ViewChild('callAPIDialog') callAPIDialog: TemplateRef<any>; // Note: TemplateRef requires a type parameter for the component reference. In this case, we're passing an `any` type as it's not a component.

  authorsJSON : JSON; // JSON that contains all available Authors and their data.
  editorsJSON : JSON; // JSON that contains all available Editors and their data for a specific book.
  booksJSON : JSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON : JSON; // JSON that contains all available Bibliography data given a specific book.

  api : ProfileComponent =  new ProfileComponent(this.httpClient, this.modalService);

  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments : JSON;
  F_Commentaar : JSON;
  F_AppCrit : JSON;
  F_Translation : JSON;
  F_Context : JSON;
  F_ContextTemp = [];
  F_Differences : JSON;
  F_ReferencerID : JSON;
  F_Reconstruction : JSON;
  F_Content : JSON;
  
  F_ContextField : String;
  
  // ID that links a specific fragment to its commentary. Used in the database.
  ReferencerID : Number = 0;

  // List with all the fragments numbers. Used to select a specific fragment for a specific editor.
  fragmentNumberList : Array<Number>;
  lineNumberList : Array<Number>;
  // Variables with currentAuthor, Book and Editor. Placeholder data.
  currentAuthor : string = "4";
  currentBook : string = "6";
  currentEditor : string = "1";

  // Does this have to do with the Bibliography modal?
  panelOpenState: boolean = false;
  allExpandState = true;

  ColumnsToggle: boolean = false; // Boolean to toggle between 2 and 3 column mode.
  spinner: boolean = true; // Boolean to toggle the spinner.

  // selectedEditor = <any>{};
  
  // This array contains all the information from a specific book. Functions can use this data.
  allFragmentsArray = [];

  // Array with the fragments of the mainEditor (left column) and of the secondary editor (right column)
  mainEditorArray = [];
  selectedEditorArray = [];

  // These should be retrieved from the database.
  mainEditorName : String = "TRF";
  currentAuthorName : String = "Ennius";
  currentBookName : String = "Thyestes";

  // Items for the forms.
  items;
  contentForm;

  // Values that are inputted by the user. Should be sanitized.
  inputAuthor: String = '';
  inputBook: String = '';
  inputEditor: String = '';

  inputFragNum: String = ''; 
  inputLineNum: String = '';
  inputFragContent: String = '';
  inputFragStatus: String = '';

  inputAppCrit: String = '';
  inputDifferences: String = '';
  inputCommentary: String = '';
  inputTranslation: String = '';
  inputReconstruction: String = '';

  inputContextAuthor: String = ''; 
  inputContext: String = '';


  // FORM FIELD DATA, VERY IMPORTANT
  selectedAuthorData: Array<String> = [''];
  selectedBookData: Array<String> = [''];
  selectedEditorData: Array<String> = [''];
  selectedFragmentData: Array<String> = [''];
  selectedLineData: Array<String> = [''];

  constructor(
    private modalService: NgbModal, 
    private httpClient: HttpClient, 
    public dialog: MatDialog, 
    private formBuilder: FormBuilder,
    ) { 
      // Form to revise the commentary of a fragment.
      this.contentForm = this.formBuilder.group({
        F_Commentaar: '',
        F_Differences: '',
        F_Context: '',
        F_Translation: '',
        F_AppCrit: '',
        F_Reconstruction: '',
        F_Content: '',
      });
    }

  /* @function:     Loads initial interface: bibliography, editors and the fragments.
   * @author:       Bors & Ycreak
   */
  async ngOnInit() {   
    // Request a list of authors to select a different text
    this.authorsJSON = await this.api.fetchData(this.currentBook, 'getAuthors') as JSON;
    
    // When init is done, turn off the loading bar (spinner)
    this.spinner = false;

    let temp = this.api.test();
    // console.log(this.api.test())
    console.log(temp)

  }

  private async requestEditors(book: string){
    // We change the current book.
    this.currentBook = book;
    this.editorsJSON = await this.api.fetchData(book, 'getEditors') as JSON;
    console.log(this.editorsJSON);
  }

  // Request Books by given Author (in the modal)
  private async requestBooks(selectedAuthor: string){
    this.booksJSON = await this.api.fetchData(selectedAuthor, 'getBooks') as JSON;
  }

  // Request Newly Selected Text
  private async requestSelectedText(book: string){
    // Get new fragments from the selected text.
    this.F_Fragments = await this.api.fetchData(book, 'getFragments') as JSON;
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    this.allFragmentsArray = this.createArrayOfObjects(this.F_Fragments);
  }

  private retrieveFragmentData(fragment : Number){
    // This should be a check whether the current editor is also a main editor
    // If the current editor has no commentary, we should not retrieve it.
    console.log('selectedFragment', fragment)
    this.ophalenCommentaren(fragment, this.currentEditor)
  }

  private getFragmentLine(lineNum: Number){
    let editor = this.selectedEditorData[0]

    let fragNum = this.selectedFragmentData

    let selectedEditorArray = this.opbouwenFragmentenEditor(editor, this.allFragmentsArray);
    
    selectedEditorArray = selectedEditorArray.filter(x => x.fragNumber === fragNum);
    selectedEditorArray = selectedEditorArray.filter(x => x.lineNumber === lineNum);

    this.F_Content = selectedEditorArray[0].lineContent
  }

  private uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
  }

  // Retrieves fragment numbers of a editor. Function needs rewriting. 
  private getFragNumbersSelectedEditor(editor: string){
    // New editor, so set him as the current one!
    this.currentEditor = editor;

    let selectedEditorArray = this.opbouwenFragmentenEditor(editor, this.allFragmentsArray);

    this.fragmentNumberList = [];
    for(let key in selectedEditorArray){      
      this.fragmentNumberList.push(selectedEditorArray[key].fragNumber);
    } 
    this.fragmentNumberList = this.uniq(this.fragmentNumberList);

    this.fragmentNumberList.sort(this.api.sortArrayNumerically3);
  }

  // Retrieves fragment numbers of a editor. Function needs rewriting. 
  private getLineNumbersSelectedEditor(fragNum: String){
    let editor = this.selectedEditorData[0];
    let selectedEditorArray = this.opbouwenFragmentenEditor(editor, this.allFragmentsArray);

    let array = selectedEditorArray.filter(x => x.fragNumber === fragNum);

    this.lineNumberList = [];
    for(let key in array){      
      this.lineNumberList.push(array[key].lineNumber);
    } 

    this.lineNumberList = this.uniq(this.lineNumberList);
    
    this.lineNumberList.sort(this.api.sortArrayNumerically3);
  }  

  private selectCorrespondingContext(author : Array<String>){
    console.log(author)
    this.F_ContextField = author[1];
    this.inputContextAuthor = author[0];
  }

  // Takes two arrays: one with author, book, editor and fragnum,
  // the other with the parameters to send: commentary and so on.
  public async pushData(givenData){
    let url = "process"

    const data = await this.httpClient.get(
      this.serverURL + url,{
        params: {
          stuff : givenData,
        }
      })
      .toPromise();
      return data;  
    }

  public async createAuthor(author : String){
    console.log(author);
    this.pushFragment('createAuthor') // TODO: Here needs a wait
    this.authorsJSON = await this.api.fetchData(this.currentBook, 'getAuthors') as JSON;
  }

  public async deleteAuthor(){
    console.log(this.selectedAuthorData[0]);
    this.pushFragment('deleteAuthor')
    this.authorsJSON = await this.api.fetchData(this.currentBook, 'getAuthors') as JSON;
  }

  public createBook(book : String){
    console.log(this.selectedAuthorData[0], book);
    this.pushFragment('createBook')
  }

  public deleteBook(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0]);
    this.pushFragment('deleteBook')
  }

  public createEditor(editor : String){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], editor);
    this.pushFragment('createEditor')
  }

  public deleteEditor(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0]);
    this.pushFragment('deleteEditor')
  }

  public setMainEditor(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0]);
    this.pushFragment('setMainEditor')
  }

  public deleteMainEditor(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0]);
    this.pushFragment('deleteMainEditor')
  }

  public createFragment(fragNum : String, lineNum : String, content : String){
    console.log(fragNum, lineNum, content);
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0]);
    this.pushFragment('createFragment')

  }
  
  public deleteFragment(){
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData);
    this.pushFragment('deleteFragment')
  }

  public uploadNewFragmentContent(input){    
    this.contentForm.reset();

    console.log('The entered data is as follows:', input);
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.inputContextAuthor);
    this.pushFragment('createFragCommentary')
  }

  public uploadRevisedFragmentContent(input){
    console.log('input', input.F_AppCrit)

    this.inputAppCrit = input.F_AppCrit;
    this.inputDifferences = input.F_Differences;
    this.inputCommentary = input.F_Commentaar;
    this.inputTranslation = input.F_Translation;
    this.inputReconstruction = input.F_Reconstruction;

    this.pushFragment('reviseFragCommentary')

  }

  public uploadRevisedContext(input){
    this.inputContext = input.F_Context;
    this.pushFragment('reviseFragContext')
  }

  public uploadRevisedFragment(input){
    this.inputFragContent = input.F_Content;
    this.pushFragment('reviseFragContent')

  }

  // Function to add commentary to a fragment
  public async uploadCommentary(inputAppCrit: String, inputDifferences: String, inputCommentary: String, inputTranslation: String){
    console.log(inputAppCrit, inputDifferences, inputCommentary, inputTranslation)
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData[0]);
  
    this.pushFragment('createFragCommentary')  
  }

  public async uploadContext(inputContextAuthor: String, inputContext: String){
    console.log(inputContextAuthor, inputContext)
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData[0]);
    this.pushFragment('createContext')  

  }

  public publishFragment(lineNumber: Number) {
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData[0]);
    this.pushFragment('publishFragment')
  }

  public unpublishFragment(lineNumber: Number) {
    console.log(this.selectedAuthorData[0], this.selectedBookData[0], this.selectedEditorData[0], this.selectedFragmentData[0]);
    this.pushFragment('unpublishFragment')
  }

  /**
  * Adds fragments into an simple array to allow them to be moved on the webpage.
  * This is necessary as moving directly from JSON is not supported by CSS.
  * @param none
  * @returns none
  * @author Ycreak
  */
  private createArrayOfObjects(array){ // Needs to be one with the one in Fragments.ts
    let outputArray = [];
    // Push every element in the allFragmentsArray
    for(let arrayElement in array){
      outputArray.push({ 
        lineNumber: array[arrayElement][1], 
        fragNumber: array[arrayElement][0],
        lineContent: array[arrayElement][3], 
        editor: array[arrayElement][2],
        published: array[arrayElement][5],
        status: array[arrayElement][6],
      })
    }
    return outputArray;
  }



  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  private opbouwenFragmentenEditor(selectedEditor: String, givenArray){
    // Filter the given array on the given editor.
    let array = givenArray.filter(x => x.editor == selectedEditor);
    array.sort(this.api.sortArrayNumerically3);

    return array;
  }

  /**
  * Retrieves commentaries when a fragment is clicked.
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
  async ophalenCommentaren(fragmentID: Number, editorID: string){
    // Turn on the spinner.
    this.spinner = true;

    console.log('data:', fragmentID, editorID)

    // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
    let F_ReferencerID = await this.api.fetchReferencerID(fragmentID, editorID, this.currentBook, 'getF_ReferencerID') as JSON;
    
    console.log('data2:',fragmentID, editorID, F_ReferencerID);
    // Retrieve the ReferencerID from the data. If not possible, throw error.
    try{
      var ReferencerID = F_ReferencerID[0][0];
      this.ReferencerID = ReferencerID;
      // Retrieves Fragment Commentary
      this.F_Commentaar = await this.api.fetchData(ReferencerID, 'getF_Commentaar') as JSON;
      // Retrieves Fragment Differences
      this.F_Differences = await this.api.fetchData(ReferencerID, 'getF_Differences') as JSON;
      // Retrieves Fragment Context
      this.F_Context = await this.api.fetchData(ReferencerID, 'getF_Context') as JSON;
      // Retrieves Fragment Translation
      this.F_Translation = await this.api.fetchData(ReferencerID, 'getF_Translation') as JSON;
      // Retrieves Fragment App. Crit.
      this.F_AppCrit = await this.api.fetchData(ReferencerID, 'getF_AppCrit') as JSON;
      // Retrieves Fragment Reconstruction
      this.F_Reconstruction = await this.api.fetchData(ReferencerID, 'getF_Reconstruction') as JSON;
    }
    catch(e){
      console.log('Cannot find the ReferencerID!');
    }
    // Turn off spinner at the end      
    this.spinner = false;
  }

//      /////////////////////////
//     // DATA TO SERVER PART //
//    /////////////////////////
  /**
  * Fetches data from the server. Returns this data in a JSON Array.
  * Also takes care of the referencer table (server side).
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
 public async pushFragment(command: String){
  const data = await this.httpClient.get(
    this.serverURL + 'process',{
      params: { // Why toString()? Url is already a string! :D
        selectedAuthor:     this.selectedAuthorData[0].toString(), 
        selectedBook:       this.selectedBookData[0].toString(), 
        selectedEditor:     this.selectedEditorData[0].toString(), 
        selectedFragment:   this.selectedFragmentData.toString(),
        selectedLine:       this.selectedLineData.toString(),
        inputAuthor:        this.inputAuthor.toString(),
        inputBook:          this.inputBook.toString(),
        inputEditor:        this.inputEditor.toString(),
      
        inputFragNum:       this.inputFragNum.toString(),
        inputLineNum:       this.inputLineNum.toString(),
        inputFragContent:   this.inputFragContent.toString(),
        inputFragStatus:    this.inputFragStatus.toString(),
        
        inputAppCrit:       this.inputAppCrit.toString(),
        inputDifferences:   this.inputDifferences.toString(),
        inputCommentary:    this.inputCommentary.toString(),
        inputTranslation:   this.inputTranslation.toString(),
        inputReconstruction: this.inputReconstruction.toString(),
        
        ReferencerID:       this.ReferencerID.toString(),
        inputContextAuthor: this.inputContextAuthor.toString(),
        inputContext :      this.inputContext.toString(),
      
        command:                command.toString(),
      }
    })
    .toPromise();
    return data;  
  }
}
