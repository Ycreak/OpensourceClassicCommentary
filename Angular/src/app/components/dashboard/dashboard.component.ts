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

  /* @member "api":       Het object dat alle requests behandelt
   * @member "root":      JSON object waarin de interface body in is opgeslagen
   * @member "ready":     Houdt bij of de interface is ingeladen
   * @member "selec...":  Houdt de waarden van de checkboxes bij
   * @member "all_f...":  Heeft alle features van alle modules
   * @member "results":   Heeft alle features gevonden door search
   */
  root : JSON;
  authors : JSON;
  editors : JSON;
  recievedCommentary : JSON;
  temp : Array<string> = [];
  books : JSON;
  bib : JSON;
  commentaar2 : JSON;
  commentaar2_deels : Array<string>;

  F_Fragments : JSON;
  F_Commentaar : JSON;
  F_AppCrit : JSON;
  F_Translation : JSON;
  F_Context : JSON;
  F_ContextTemp = [];
  F_Differences : JSON;
  F_ReferencerID : JSON;
  F_Reconstruction : JSON;
  ReferencerID : Number;

  F_ContextField : String;

  // List with all the fragments numbers.
  fragmentList : Array<Number>;

  tempJSON : JSON;

  givenJSON : JSON;

  requestedItem : Array<String>;
  // requestedJSON : JSON;

  ready : boolean = false;
  results : string[] = [];
  closeResult: string;

  currentCommentaar: Number;

  stringArray : Array<string> = [];

  givenText : Array<string> = [];

  currentAuthor : String = "4";
  currentBook : String = "6";
  startupBook : String = "6";

  selectedLine : number = 0;
  gegevenRegel : number = 0;

  panelOpenState: boolean = false;
  allExpandState = true;

  fragments : boolean = false;
  listColumn1 = [];

  show: boolean = false;
  showFragments: boolean = true;
  spinner: boolean = true;

  column1Array = [];
  column2Array = [];
  selectedEditor = <any>{};
  allFragmentsArray = [];

  mainEditorArray = [];
  selectedEditorArray = [];

  mainEditorKey : Number = 1;
  mainEditorName : String = "TRF";
  currentAuthorName : String = "Ennius";
  currentBookName : String = "Thyestes";
  currentEditor : Number = 1;

  serverURL = 'http://katwijk.nolden.biz:5002/';  

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
    // Request a list of editors from the current text to list in the second column
    this.editors = await this.fetchData(this.currentBook, 'getEditors') as JSON;
    
    // Request a list of authors to select a different text
    this.authors = await this.fetchData(this.currentBook, 'getAuthors') as JSON;
    
    // Retrieves everything surrounding the text.
    this.requestSelectedText(this.currentBook);
 
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
  private setCreateFragmentParameters(author : Array<String>, book : Array<String>, editor : Array<String>){
    this.currentAuthor = author[0]; // = key
    this.currentBook = book[0]; // = key
    this.currentEditor = Number(editor[0]); // = key
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
    this.editors = await this.fetchData(book, 'getEditors') as JSON;
    console.log(this.editors);
  }

  // Retrieves fragment numbers of a editor. Function is spaghetti and needs rewriting. 
  private getFragNumbersSelectedEditor(author : Array<String>, book : Array<String>, editor : Array<String>){
    let selectedEditorArray = this.opbouwenFragmentenEditor(editor[0], this.allFragmentsArray);

    this.fragmentList = [];
    for(let key in selectedEditorArray){
      this.fragmentList.push(selectedEditorArray[key].lineNumber);
    }
  }

  private addSecondaryFrag(fragNum : String, lineNum : String, content : String){
      console.log('addSecondaryFrag');
  }

  private retrieveFragmentData(fragment : Number){
    // console.log(fragment)
    this.ophalenCommentaren(fragment, this.currentEditor)
  }

  private getFragmentContent(lineNumber: Number){
    console.log(lineNumber);
    console.log(this.currentEditor, lineNumber);

    this.changeSelectedEditor(String(this.currentEditor));

    let item1 = this.selectedEditorArray.find(i => i.lineNumber === lineNumber);
    console.log(item1.lineContent)
    this.F_Content = item1.lineContent
  }


  items;
  contentForm;

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
  private async requestSelectedText(selectedText: String){
    // Update CurrentBook.
    this.currentBook = selectedText;
    // Get new fragments from the selected text.
    this.F_Fragments = await this.fetchData(selectedText, 'getFragments') as JSON;
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    this.allFragmentsArray = this.createArrayOfObjects(this.F_Fragments);
    // Select the fragments from the editor you want in the left column.
    this.mainEditorArray = this.opbouwenFragmentenEditor("1", this.allFragmentsArray);
    // Retrieve the bibliography corresponding to the text.
    this.bib = await this.fetchData(selectedText, 'getBibliography') as JSON;
    
    // TODO: method to get current editor name
    // TODO: method to get current author name
    // TODO: method to get current book name
        // this.currentBookName = this.retrieveDataFromJSON(this.books, this.currentBook, 0, 1);

    // List with Fragment Numbers (for input) (No idea what this function does)
    this.getFragmentNumbers();
  }

  // Request Books by given Author (in the modal)
  private async requestBooks(selectedAuthor: String){
    this.books = await this.fetchData(selectedAuthor, 'getBooks') as JSON;
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
  private async fetchReferencerID(fragmentID: Number, editorID: Number, currentBook : String, url : String){
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
  async ophalenCommentaren(fragmentID: Number, editorID: Number){
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

     ////////////////////////////
    // HTML RELATED FUNCTIONS //
   ////////////////////////////
  // Allows a fragment to be moved and dropped to create a custom ordering
  moveAndDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedEditorArray, event.previousIndex, event.currentIndex);
  }

  // Toggles right column
  public toggleShowFragments(){
    this.showFragments = !this.showFragments;
    // this.showFragmentsFalse = !this.showFragmentsFalse;
  }

  // Create a small modal
  public openSm(content) {
    this.modalService.open(content, { size: 'sm' });
  }
  // Create a large modal
  public openLg(bib1) {
    this.modalService.open(bib1, { windowClass: 'modal-sizer' });
  }
  // Allows a basic modal to be opened
  public openBm(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }

  public callAPI() {
    let dialogRef = this.dialog.open(this.callAPIDialog);
    dialogRef.afterClosed().subscribe(result => {
        // Note: If the user clicks outside the dialog or presses the escape key, there'll be no result
        if (result !== undefined) {
            if (result === 'yes') {
                // TODO: Replace the following line with your code.
                console.log('User clicked yes.');
            } else if (result === 'no') {
                // TODO: Replace the following line with your code.
                console.log('User clicked no.');
            }
        }
    })  
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

    public async retrieveSelectedFragment(selectedFragment:String){
      let Temp_ReferencerID = await this.fetchReferencerID(Number(selectedFragment), 1, this.currentBook, 'getF_ReferencerID') as JSON;
      console.log('this: ', this.allFragmentsArray);

      this.tempArray = this.allFragmentsArray.filter(x => x.lineNumber == selectedFragment);
      console.log(this.tempArray);
    }



  public async uploadCommentary(){
      // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
      let Temp_ReferencerID = await this.fetchReferencerID(Number(this.input_selectedFragment), 1, this.currentBook, 'getF_ReferencerID') as JSON;
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
      let Temp_ReferencerID = await this.fetchReferencerID(Number(this.input_selectedFragment), 1, this.currentBook, 'getF_ReferencerID') as JSON;
      // Retrieve the ReferencerID from the data. If not possible, throw error.
      try{
        var ReferencerID = Temp_ReferencerID[0][0];
      }
      catch(e){
        console.log('Cannot find the ReferencerID!');
      }

    console.log('ref: ', ReferencerID);
    
    if(this.currentBook == '7'){
      this.pushContext(this.currentBook, 'insertContext', this.given_ContextAuthor, this.given_Context, ReferencerID);
    }
    else{
      console.log("THIS BOOK IS PROTECTED");
    }
  }

  public getFragmentNumbers(){
    this.fragmentList = [];
    for(let key in this.mainEditorArray){
      this.fragmentList.push(this.mainEditorArray[key].lineNumber);
    }
    console.log(this.mainEditorArray, this.fragmentList)
  }

  public inputSelectedEditor(selectedEditor : String){
    this.input_selectedEditor = selectedEditor;
    console.log(this.input_selectedEditor);
  }

  public inputSelectedFragment(selectedFragment : String){
    this.input_selectedFragment = selectedFragment;
    console.log(selectedFragment);
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
