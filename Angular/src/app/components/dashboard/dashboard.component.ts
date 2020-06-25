import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';

import {ThemePalette} from '@angular/material/core';
import {FormControl, FormGroupDirective, FormGroup, NgForm, Validators} from '@angular/forms';
import { TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import 'hammerjs';

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
  
  F_ContextField : String;

  // ID that links a specific fragment to its commentary. Used in the database.
  ReferencerID : Number;

  // List with all the fragments numbers. Used to select a specific fragment for a specific editor.
  fragmentNumberList : Array<Number>;

  // Variables with currentAuthor, Book and Editor. Placeholder data.
  currentAuthor : String = "4";
  currentBook : String = "6";
  currentEditor : String = "1";

  // Does this have to do with the Bibliography modal?
  panelOpenState: boolean = false;
  allExpandState = true;

  ColumnsToggle: boolean = false; // Boolean to toggle between 2 and 3 column mode.
  spinner: boolean = true; // Boolean to toggle the spinner.

  selectedEditor = <any>{};
  
  // This array contains all the information from a specific book. Functions can use this data.
  allFragmentsArray = [];

  // Array with the fragments of the mainEditor (left column) and of the secondary editor (right column)
  mainEditorArray = [];
  selectedEditorArray = [];

  // These should be retrieved from the database.
  mainEditorName : String = "TRF";
  currentAuthorName : String = "Ennius";
  currentBookName : String = "Thyestes";

  // URL for the server.
  serverURL = 'http://katwijk.nolden.biz:5002/';  

  // Items for the forms.
  items;
  contentForm;

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
    this.authorsJSON = await this.fetchData(this.currentBook, 'getAuthors') as JSON;
    
    // When init is done, turn off the loading bar (spinner)
    this.spinner = false;
  }

  /**
  * Fetches data from the server. Returns this data in a JSON Array.
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
  private async fetchData(currentBook : String, url : String){
    const data = await this.httpClient.get(
      this.serverURL + url,{
        params: {
          currentBook: currentBook.toString(),
        }
      })
      .toPromise();
    return data;  
  }

  // Takes two arrays: one with author, book, editor and fragnum,
  // the other with the parameters to send: commentary and so on.
  public async pushData(currentParameters, items2Send, url){
    const data = await this.httpClient.get(
      this.serverURL + url,{
        params: {

        }
      })
      .toPromise();
      return data;  
    }

  // ADD REMOVE TAB GROUP
  private createAuthor(author : String){
    console.log(author);
  }

  private deleteAuthor(author : Array<String>){
    let key = author[0]
    let name = author[1]
    console.log(author, key, name);
  }

  // Gets author array [key, name] and book array [key, name]
  // Returns them to server to be added.
  private createBook(author : Array<String>, book : String){
    console.log(author, book);
  }

  private deleteBook(author : Array<String>, book : Array<String>){
    console.log(author, book);
  }

  private createEditor(author : Array<String>, book : Array<String>, editor : String){
    console.log(author, book, editor);
  }

  private deleteEditor(author : Array<String>, book : Array<String>, editor : Array<String>){
    console.log(author, book, editor);
  }

  private setMainEditor(author : Array<String>, book : Array<String>, editor : Array<String>){
    console.log(author, book, editor);
  }

  // CREATE FRAGMENT TAB GROUP
  private setAuthorBookEditor(author : String, book : String, editor : String){
    this.currentAuthor = author; // = key
    this.currentBook = book; // = key
    this.currentEditor = editor; // = key
    console.log('Author, Book and Editor set.')
    console.log(this.currentAuthor, this.currentBook, this.currentEditor)
  }

  private createFragment(fragNum : String, lineNum : String, content : String){
    console.log(fragNum, lineNum, content);
    
    // if(this.currentBook == '7'){
      // this.pushFragment(this.currentBook, 'insertFragment', fragNum, this.currentEditor, content, '1');
    // }
  }

  private async requestEditors(author : String, book : String){
    this.editorsJSON = await this.fetchData(book, 'getEditors') as JSON;
    console.log(this.editorsJSON);
  }

  // Request Books by given Author (in the modal)
  private async requestBooks(selectedAuthor: String){
    this.booksJSON = await this.fetchData(selectedAuthor, 'getBooks') as JSON;
  }

  // Retrieves fragment numbers of a editor. Function is spaghetti and needs rewriting. 
  private getFragNumbersSelectedEditor(author : Array<String>, book : Array<String>, editor : Array<String>){
    let selectedEditorArray = this.opbouwenFragmentenEditor(editor[0], this.allFragmentsArray);

    this.fragmentNumberList = [];
    for(let key in selectedEditorArray){
      this.fragmentNumberList.push(selectedEditorArray[key].lineNumber);
    }
  }

  private addSecondaryFrag(fragNum : String, lineNum : String, content : String){
      console.log('addSecondaryFrag');
  }

  private retrieveFragmentData(fragment : Number){
    // console.log(fragment)

    // This should be a check whether the current editor is also a main editor
    // If the current editor has no commentary, we should not retrieve it.
    if(this.currentEditor ==  '1'){
      this.ophalenCommentaren(fragment, this.currentEditor)
    }

  }

  private getFragmentContent(lineNumber: Number){
    // console.log(this.currentEditor, lineNumber);

    this.changeSelectedEditor(String(this.currentEditor));

    let item1 = this.selectedEditorArray.find(i => i.lineNumber === lineNumber);
    console.log(item1.lineContent)
    this.F_Content = item1.lineContent



  }




  public submitChangedContent(input){    
    // Process checkout data here
    // this.items = this.cartService.clearCart();
    this.contentForm.reset();

    console.log('Your order has been submitted', input, input.name);
  }

  private uploadReworkedCommentary(){
    // Needed values are in the form. 
  }

  private selectCorrespondingContext(author : Array<String>){
    this.F_ContextField = author[1];
    let currentAuthor = author[0]; // Used to combine Author + Text
    console.log(this.F_Context, author)
  }

  private uploadReworkedContext(author : String){

    console.log(this.F_ContextField);

  }  

  // Request Newly Selected Text
  private async requestSelectedText(){
    // Get new fragments from the selected text.
    this.F_Fragments = await this.fetchData(this.currentBook, 'getFragments') as JSON;
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    this.allFragmentsArray = this.createArrayOfObjects(this.F_Fragments);
  }

  /**
  * Adds fragments into an simple array to allow them to be moved on the webpage.
  * This is necessary as moving directly from JSON is not supported by CSS.
  * @param none
  * @returns none
  * @author Ycreak
  */
  private createArrayOfObjects(array){
    let outputArray = [];
    // Push every element in the allFragmentsArray
    for(let arrayElement in array){
      outputArray.push({ 
        // id: array[arrayElement][0], 
        lineNumber: array[arrayElement][1], 
        fragNumber: array[arrayElement][2],
        lineContent: array[arrayElement][3], 
        editor: array[arrayElement][4],
        published: array[arrayElement][5],
        status: array[arrayElement][6],
      })
    }
    return outputArray;
  }

  /**
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */
  private sortArrayNumerically(a, b) {
    // Sort array via the number element given.
    const A = a.lineNumber;
    const B = b.lineNumber;
  
    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
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
    array.sort(this.sortArrayNumerically);

    return array;
  }

  /**
  * Fetches referencerID from the server. Returns this data in a JSON Array. Needs to be
  * combined with the fetchData function (but has different parameters xD)
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
  private async fetchReferencerID(fragmentID: Number, editorID: String, currentBook : String, url : String){
    const data = await this.httpClient.get(
      this.serverURL + url,{
        params: {
          fragmentID: fragmentID.toString(),
          editorID: editorID.toString(),
          currentBook: currentBook.toString(),
        }
      })
      .toPromise();
    return data;  
  }
  /**
  * Retrieves commentaries when a fragment is clicked.
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
  async ophalenCommentaren(fragmentID: Number, editorID: String){
    // Turn on the spinner.
    this.spinner = true;
    // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
    let F_ReferencerID = await this.fetchReferencerID(fragmentID, editorID, this.currentBook, 'getF_ReferencerID') as JSON;
    // Retrieve the ReferencerID from the data. If not possible, throw error.
    try{
      var ReferencerID = F_ReferencerID[0][0];
    }
    catch(e){
      console.log('Cannot find the ReferencerID!');
    }
    // Retrieves Fragment Commentary
    this.F_Commentaar = await this.fetchData(ReferencerID, 'getF_Commentaar') as JSON;
    // Retrieves Fragment Differences
    this.F_Differences = await this.fetchData(ReferencerID, 'getF_Differences') as JSON;
    // Retrieves Fragment Context
    this.F_Context = await this.fetchData(ReferencerID, 'getF_Context') as JSON;
    // Retrieves Fragment Translation
    this.F_Translation = await this.fetchData(ReferencerID, 'getF_Translation') as JSON;
    // Retrieves Fragment App. Crit.
    this.F_AppCrit = await this.fetchData(ReferencerID, 'getF_AppCrit') as JSON;
    // Retrieves Fragment Reconstruction
    this.F_Reconstruction = await this.fetchData(ReferencerID, 'getF_Reconstruction') as JSON;
    // Turn off spinner at the end
    this.spinner = false;
  }

     /////////////////////////
    // DATA TO SERVER PART //
   /////////////////////////
  // Data that will be send to the server.
  input_selectedEditor : String;
  input_FragmentNum : String;
  input_FragmentContent : String;
  input_selectedFragment : String;

  given_fragNum : String;
  given_fragContent : String;
  given_Editor : String;
  
  given_AppCrit : String;
  given_Differences : String;
  given_Context : String;
  given_ContextAuthor : String;
  given_Commentary : String;
  given_Translation : String;

  given_note : String;

  fragmentArray : Array<String> = [];

  tempArray : Array<String>;

  F_Content : JSON;

  /**
  * Fetches data from the server. Returns this data in a JSON Array.
  * Also takes care of the referencer table (server side).
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
 public async pushFragment(currentBook : String, url : String, fragmentNo : String, editor : String, content : String, primFrag: String){
  const data = await this.httpClient.get(
    this.serverURL + url,{
      params: {
        currentBook: currentBook.toString(),
        fragmentNo : fragmentNo.toString(),
        editor : editor.toString(),
        content : content.toString(),
        primFrag : primFrag.toString(),
      }
    })
    .toPromise();
    return data;  
  }

  public async pushCommentary(currentBook : String, url : String, AppCrit : String, Differences : String, 
    Commentary : String, Translation : String, fragmentNum : String, ReferencerID : String){
    const data = await this.httpClient.get(
      this.serverURL + url,{
        params: {
          book : currentBook.toString(),
          appcrit : AppCrit.toString(),
          diff : Differences.toString(),
          comment : Commentary.toString(),
          trans : Translation.toString(),
          frag : fragmentNum.toString(),
          ref : ReferencerID.toString(),
        }
      })
      .toPromise();
      return data;  
    }

    public async pushContext(currentBook : String, url : String, Author : String, Context : String, ReferencerID : String){
      const data = await this.httpClient.get(
        this.serverURL + url,{
          params: {
            context : Context.toString(),
            author : Author.toString(),
            ref : ReferencerID.toString(),
          }
        })
        .toPromise();
        return data;  
    }

    // public async retrieveSelectedFragment(selectedFragment:String){
    //   let Temp_ReferencerID = await this.fetchReferencerID(Number(selectedFragment), 1, this.currentBook, 'getF_ReferencerID') as JSON;
    //   console.log('this: ', this.allFragmentsArray);

    //   this.tempArray = this.allFragmentsArray.filter(x => x.lineNumber == selectedFragment);
    //   console.log(this.tempArray);
    // }



  public async uploadCommentary(){
      // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
      let Temp_ReferencerID = await this.fetchReferencerID(Number(this.input_selectedFragment), '1', this.currentBook, 'getF_ReferencerID') as JSON;
      // Retrieve the ReferencerID from the data. If not possible, throw error.
      try{
        var ReferencerID = Temp_ReferencerID[0][0];
      }
      catch(e){
        console.log('Cannot find the ReferencerID!');
      }

    console.log('ref: ', ReferencerID);
    
    if(this.currentBook == '7'){
      this.pushCommentary(this.currentBook, 'insertCommentary', this.given_AppCrit, this.given_Differences, 
        this.given_Commentary, this.given_Translation, this.input_selectedFragment, ReferencerID);
    }
    else{
      console.log("THIS BOOK IS PROTECTED");
    }
  }

  public async uploadContextAuthor(){
      // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
      let Temp_ReferencerID = await this.fetchReferencerID(Number(this.input_selectedFragment), '1', this.currentBook, 'getF_ReferencerID') as JSON;
      // Retrieve the ReferencerID from the data. If not possible, throw error.
      try{
        var ReferencerID = Temp_ReferencerID[0][0];
      }
      catch(e){
        console.log('Cannot find the ReferencerID! Your probably working with a secondary editor.');
      }

    console.log('ref: ', ReferencerID);
    
    if(this.currentBook == '7'){
      this.pushContext(this.currentBook, 'insertContext', this.given_ContextAuthor, this.given_Context, ReferencerID);
    }
    else{
      console.log("THIS BOOK IS PROTECTED");
    }
  }

     ////////////////////////////
    // TASK RELATED FUNCTIONS //
   ////////////////////////////
  task: Task = {
    name: 'Indeterminate',
    completed: false,
    color: 'primary',
    subtasks: [
      {name: 'Primary', completed: false, color: 'primary'},
      {name: 'Accent', completed: false, color: 'accent'},
      {name: 'Warn', completed: false, color: 'warn'}
    ]
  };

  allComplete: boolean = false;

  publishFragment(lineNumber: Number) {
    // this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
    console.log('updateAllComplete', lineNumber, this.currentBook, this.selectedEditor)
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => t.completed = completed);
  }

  changeSelectedEditor(givenEditor: String){
    this.selectedEditor = givenEditor;
    this.selectedEditorArray = this.opbouwenFragmentenEditor(givenEditor, this.allFragmentsArray);
  }




}
