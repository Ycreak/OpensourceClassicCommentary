import { Component, OnInit } from '@angular/core';
// Allows for connecting Angular to a database over HTTP.
import { HttpClient} from '@angular/common/http';
// Allows for drag and drop items in HTML
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
// Library used for interacting with the page
import {MatDialog} from '@angular/material/dialog';
// To allow dialog windows within the current window
import { TemplateRef, ViewChild } from '@angular/core';
// Imports of different components to be shown within a dialog within the page
import {DashboardComponent} from './dashboard/dashboard.component'

// Main class to show the fragments on screen.
@Component({
  selector: 'app-interface',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.css'],
})
export class FragmentsComponent implements OnInit {
  // Children to allow dialogs to be created within the current page
  // Note: TemplateRef requires a type parameter for the component reference. 
  // In this case, we're passing an `any` type as it's not a component.
  @ViewChild('callBibliography') callBibliography: TemplateRef<any>;
  @ViewChild('callBookSelect') callBookSelect: TemplateRef<any>;
  @ViewChild('callAbout') callAbout: TemplateRef<any>;

  // Import of class used for database communication
  // api : ProfileComponent = new ProfileComponent(this.httpClient);
  api = new MainComponent(this.httpClient);
  // this.api = new APIComponent(this.httpClient);

  // Variables to split the bibliography in different sections.
  bibBooks : JSON;
  bibArticles: JSON;
  bibWebsites: JSON;
  // bibInCollection : JSON; // Maybe add this one yet?
  // Toggle switches
  ColumnsToggle: boolean = true; // Boolean to toggle between 2 and 3 column mode.
  // Need to rethink this
  selectedEditor = <any>{}; // EHm?
  
  // Simple constructor
  constructor(
    private httpClient: HttpClient, 
    public dialog: MatDialog, 
    ) { }

  /* @function:     Loads initial interface: bibliography, editors and the fragments.
   * @author:       Bors & Ycreak
   */
  async ngOnInit() {     
    // Request a list of authors to select a different text
    this.api.authorsJSON = await this.api.fetchData(this.api.currentBook, 'getAuthors') as JSON;
    // Request a list of editors from the current text to list in the second column
    this.api.editorsJSON = await this.api.fetchData(this.api.currentBook, 'getEditors') as JSON;
    // Retrieves everything surrounding the text. TODO. Needs fixing
    this.requestSelectedText(['6','Thyestes']);
    // When init is done, turn off the loading bar (spinner)
    this.api.spinner = false;
  }

  // Request Newly Selected Text, called on Init and after selecting new text.
  private async requestSelectedText(selectedText: Array<string>){  
    // Update current book and author
    this.api.currentBook = selectedText[0];
    this.api.currentBookName = selectedText[1];
    // Create the JSON with the Editors for the current book.
    this.api.editorsJSON = await this.api.fetchData(this.api.currentBook, 'getEditors') as JSON;
    // Get new fragments from the selected text.
    this.api.F_Fragments = await this.api.fetchData(this.api.currentBook, 'getFragments') as JSON;
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    this.api.ArrayWithAllFragments = this.api.putFragmentsInMoveableArray(this.api.F_Fragments);   
    // Select the fragments from the editor you want in the left column.
    this.api.mainEditorArray = this.createEditorArray(this.api.currentEditor, this.api.ArrayWithAllFragments);
    // Create a list of main Editors.
    this.api.mainEditorsJSON = this.createMainEditorArray(this.api.editorsJSON)
    // Retrieve the bibliography corresponding to the text.
    this.api.bibJSON = await this.api.fetchData(this.api.currentBook, 'getBibliography') as JSON;
    this.processBib(this.api.bibJSON);
  }

  // is called to get authors
  private async getAuthors(book){
    return await this.api.fetchData(book, 'getAuthors');
  }

  // is called to get authors
  private async getEditors(book){
    return await this.api.fetchData(book, 'getEditors');
  }

  // Request Books by given Author (in the modal)
  private async getBooks(selectedAuthor: Array<string>){
    this.api.currentAuthor = Number(selectedAuthor[0])
    this.api.currentAuthorName = selectedAuthor[1];
    this.api.booksJSON = await this.api.fetchData(selectedAuthor[0], 'getBooks') as JSON;
  }
  
  private getCurrentBookData(){

  }

  private setCurrentBookData(){
    // this.api.currentBook = Number(selectedAuthor[0])
    // this.api.currentBookName = selectedAuthor[1];
  }

  private getCurrentAuthorData(){

  }

  private setCurrentAuthorData(){
    // this.api.currentAuthor = Number(selectedAuthor[0])
    // this.api.currentAuthorName = selectedAuthor[1];
  }

  // Separate bib entries using unique field filters.
  private processBib(bib){
    this.bibArticles = bib.filter(x => x[3] !== null);
    this.bibBooks = bib.filter(x => x[2] !== null);
    this.bibWebsites = bib.filter(x => x[10] !== null);
  }

  // This function merges the multiple lines in a single fragment.
  // The structure looks as follows: Fragment 2, [[1, "hello"],[2,"hi"]]
  // Function way to long... Function in function needed here.
  public mergeLinesIntoFragment(givenArray){
    // String that will be used to build the fragment
    let buildString = ""
    // Array that will be used to return a merged array
    var merged = [];
    var contentObject = [];
    // For every element in the givenArray, check if it is merged into one fragment.
    for(let element in givenArray){ 
      // console.log(merged)
      let fragNum = givenArray[element].fragNumber;
      let lineNum = givenArray[element].lineNumber;
      let lineCont = givenArray[element].lineContent;
      let stat = givenArray[element].status  
      let buildString = '<p>' + lineNum + ': ' + lineCont + '</p>';
      // Check if array has at least one element.
      if (Array.isArray(merged) && merged.length) {
        // Check if a new fragment needs to be created, or if there should be a merge
        if(merged.find(el => el.fragNumber === fragNum)){
          // Fragment already present, merging.
          let foundFragment = merged.find(el => el.fragNumber === fragNum)
          let tempContent = foundFragment.content;

          tempContent.push({
            lineNumber: lineNum,
            lineContent: lineCont,
            lineComplete: buildString,
          })

          // Horrible code to find the current merge entry to be deleted.
          const index1 = merged.findIndex((el => el.fragNumber === fragNum))
          merged.splice(index1,1)

          merged.push({ fragNumber: fragNum, content: tempContent, status: stat})

          contentObject = [];
        }
        else{
          // Fragment to be created
          contentObject.push({
            lineNumber: lineNum,
            lineContent: lineCont,
            lineComplete: buildString,
          })
          
          merged.push({ fragNumber: fragNum, content: contentObject, status: stat})

          contentObject = [];
        }
      }
      else{    
        // Push the first item always, as the array is empty.
        contentObject.push({
          lineNumber: lineNum,
          lineContent: lineCont,
          lineComplete: buildString,
        })
  
        merged.push({ fragNumber: givenArray[element].fragNumber, content: contentObject, status: stat})
        contentObject = [];
      }     
    }
    // Sort the lines in merged, needs to be own function
    for(let element in merged){
      merged[element].content.sort(this.api.sortArrayNumerically2);
    }
    console.log('sorted:', merged)
    return merged;
  }

  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  private createEditorArray(selectedEditor: string, givenArray){
    // Filter the given array on the given editor.
    let array = givenArray.filter(x => x.editor == selectedEditor);
    
    array.sort(this.api.sortArrayNumerically);

    array = this.mergeLinesIntoFragment(array);
    return array;
  }

  // Creates main editor array: the third field has the mainEditor key. Should be named properly.
  private createMainEditorArray(givenArray){
    let array = givenArray.filter(x => x[2] == 1);
    return array;
  }
     ////////////////////////////
    // HTML RELATED FUNCTIONS //
   ////////////////////////////
  // Allows a fragment to be moved and dropped to create a custom ordering
  moveAndDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.api.selectedEditorArray, event.previousIndex, event.currentIndex);
  }
  // Opens dialog for the bibliography
  public openBibliography() {
    let dialogRef = this.dialog.open(this.callBibliography); 
  }
  // Opens dialog to select a new book
  public openBookSelect() {
    let dialogRef = this.dialog.open(this.callBookSelect); 
  }
  // Opens dialog for the about information
  public openAbout() {
    const dialogRef = this.dialog.open(ShowAboutDialog);
  }
  // Opens dialog for the dashboard
  public openDashboard() {
    const dialogRef = this.dialog.open(DashboardComponent);
  }
  // Simple test function for debugging purposes
  public test(){
    console.log('hello there!', this.api.booksJSON);
  }

} // CLASS ENDS HERE

// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: './dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

// This class holds all the information necessary for the program to work properly
export class MainComponent implements OnInit {
  authorsJSON : JSON; // JSON that contains all available Authors and their data.
  editorsJSON : JSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON : JSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON : JSON; // JSON that contains all available Bibliography data given a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments : JSON;
  F_Commentaar : JSON;
  F_AppCrit : JSON;
  F_Translation : JSON;
  F_Context : JSON;
  F_ContextField : String;
  F_Content : JSON;
  F_Differences : JSON;
  F_ReferencerID : JSON;
  F_Reconstruction : JSON;
  // This variable holds the link between the commentaries and the selected fragment
  ReferencerID : string = '0';
  // Variables with currentAuthor, Book and Editor. Placeholder data.
  currentAuthor : Number = 4;
  currentBook : string = '6';
  currentEditor : string = '1';
  currentFragment : Number;
  currentAuthorName : String = "Ennius";
  currentBookName : String = "Thyestes";
  // This array contains all the information from a specific book. Functions can use this data.
  ArrayWithAllFragments = [];
  selectedEditorArray = [];
  mainEditorArray = [];
  // Server URL to communicate with database
  serverURL = 'http://katwijk.nolden.biz:5002/';  

  spinner: boolean = true; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.

  constructor(
    private httpClient: HttpClient, 
  ) { }
  // This function does nothing on init, but gets called to retrieve data for other functions.
  ngOnInit() {
  }

  public test(){
    console.log('hello there!')
    let variable = 6;
    return variable;
  }

  /**
  * Fetches referencerID from the server. Returns this data in a JSON Array. 
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
 public async fetchReferencerID(fragmentID: Number, editorID: string, currentBook : string, url : string){
  const data = await this.httpClient.get(
    this.serverURL + url,{
      params: {
        fragment: fragmentID.toString(),
        editorID: editorID.toString(),
        currentBook: currentBook.toString(),
      }
    })
    .toPromise();
  return data;  
  }

  /**
  * Fetches data from the server. Returns this data in a JSON Array.
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
 public async fetchData(currentBook : string, url : String){
  const data = await this.httpClient.get(
    this.serverURL + url,{
      params: {
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
 public async retrieveCommentaries(fragmentID: Number){
  console.log('fragment, editor, book: ', fragmentID, this.currentEditor, this.currentBook)
  this.currentFragment = fragmentID;
  // Turn on the spinner.
  this.spinner = true;
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  let F_ReferencerID = await this.fetchReferencerID(fragmentID, this.currentEditor, this.currentBook, 'getF_ReferencerID') as JSON;
  // Retrieve the ReferencerID from the data. If not possible, throw error.
  try{
    this.ReferencerID = F_ReferencerID[0][0];
    // Retrieves Fragment Commentary
    this.F_Commentaar = await this.fetchData(this.ReferencerID, 'getF_Commentaar') as JSON;
    // Retrieves Fragment Differences
    this.F_Differences = await this.fetchData(this.ReferencerID, 'getF_Differences') as JSON;
    // Retrieves Fragment Context
    this.F_Context = await this.fetchData(this.ReferencerID, 'getF_Context') as JSON;
    // Retrieves Fragment Translation
    this.F_Translation = await this.fetchData(this.ReferencerID, 'getF_Translation') as JSON;
    // Retrieves Fragment App. Crit.
    this.F_AppCrit = await this.fetchData(this.ReferencerID, 'getF_AppCrit') as JSON;
    // Retrieves Fragment Reconstruction
    this.F_Reconstruction = await this.fetchData(this.ReferencerID, 'getF_Reconstruction') as JSON;
    // Turn off spinner at the end
  }
  catch(e){ // Show error and set F_Commentaar to NULL: an error means also no commentary.
    console.log('Cannot find the ReferencerID!');
    this.F_Commentaar = JSON;
  }
  // Check if the received commentary is empty. If so, show a banner.
  if(this.isEmpty(this.F_Commentaar)){
    this.noCommentary = true;
  }
  else{
    this.noCommentary = false;
  }
  this.spinner = false;
}

  /**
  * Adds fragments into an simple array to allow them to be moved on the webpage.
  * This is necessary as moving directly from JSON is not supported by CSS.
  * TODO: I want this for all the other arrays for easy selection.
  * @param none
  * @returns none
  * @author Ycreak
  */
 public putFragmentsInMoveableArray(array){
  console.log('array', array)
  let outputArray = [];
  // Push every element in the ArrayWithAllFragments
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

  // Checks if an object is empty. Returns a boolean.
  public isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
  }

  /**
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */ // TODO: Should put Adesp and Incert. on the bottom. 
  public sortArrayNumerically(a, b) {
    // Sort array via the number element given.
  
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.fragNumber.split("-", 1));
    const B = Number(b.fragNumber.split("-", 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

    /** A PARAMETER SHOULD BE GIVEN BUT I AM A WORTHLESS PROGRAMMER xD lineNumber vs fragNumber
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */ // TODO: Should put Adesp and Incert. on the bottom. 
  public sortArrayNumerically2(a, b) {
    // Sort array via the number element given.
  
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.lineNumber.split("-", 1));
    const B = Number(b.lineNumber.split("-", 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

  /**
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */ // TODO: Should put Adesp and Incert. on the bottom. 
  public sortArrayNumerically3(a, b) {
    // Sort array via the number element given.
  
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a);
    const B = Number(b);

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }  
}