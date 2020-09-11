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
  // main : ProfileComponent = new ProfileComponent(this.httpClient);
  main = new MainComponent(this.httpClient);
  server = new ServerCommunicator(this.httpClient);

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
    this.main.authorsJSON = await this.server.requestAuthors(this.main.currentBook);
    // Retrieves everything surrounding the text. TODO. Needs fixing
    this.requestSelectedText(['6','Thyestes']);
    // When init is done, turn off the loading bar (spinner)
    this.main.spinner = false;
  }

  // Request Newly Selected Text, called on Init and after selecting new text.
  private async requestSelectedText(selectedText: Array<string>){  
    // Update current book and author.
    this.main.setCurrentBookData(selectedText);
    // Create the JSON with the Editors for the current book.
    this.main.editorsJSON = await this.server.requestEditors(this.main.currentBook);
    // Create a list of main Editors from the retrieved editorsJSON.
    this.main.mainEditorsJSON = this.createMainEditorArray(this.main.editorsJSON)  
    // Set the first found main editor as default
    this.main.currentEditor = this.main.mainEditorsJSON[0][0]
    // Get new fragments from the selected text.
    this.main.F_Fragments = await this.server.requestFragments(this.main.currentBook);
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    this.main.FragmentsArray = this.main.tagFragments(this.main.F_Fragments); 
    // Select the fragments from the editor you want in the left column.
    this.main.mainEditorArray = this.createEditorArray(this.main.currentEditor, this.main.FragmentsArray);
    // Retrieve the bibliography corresponding to the text.
    this.main.bibJSON = await this.server.requestBibliography(this.main.currentBook);
    // Process the retrieved bibliography to appear formatted in the dialog.
    this.processBib(this.main.bibJSON);
  }

  //FIXME: this is horrible hacking
  private async tempBooks(author){
    this.main.booksJSON = await this.server.requestBooks(author) as JSON;
  }

  //FIXME: hacking, hacking everywhere!
  public async TEMPrequestSelectedText(){
    this.requestSelectedText([this.main.currentBook,this.main.currentBookName]);
  }

  // Separate bib entries using unique field filters.
  private processBib(bib){
    this.bibArticles = bib.filter(x => x[3] !== null);
    this.bibBooks = bib.filter(x => x[2] !== null);
    this.bibWebsites = bib.filter(x => x[10] !== null);
  }

  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  private createEditorArray(editor: string, array){
    // Filter the given array on the given editor.
    let tempArray = array.filter(x => x.editor == editor);
    // Sort the lines numerically.
    tempArray.sort(this.main.sortArrayNumerically);
    // Merge the different lines into their corresponding fragments
    
    return this.mergeLinesIntoFragment(tempArray);
  }

  // Creates main editor array: the third field has the mainEditor key. Should be named properly.
  private createMainEditorArray(array){
    return array.filter(x => x[2] == 1);
  }

  // This function merges the multiple lines in a single fragment.
  // The structure looks as follows: Fragment 2, [[1, "hello"],[2,"hi"]]
  // Function way to long... Function in function needed here.
  public mergeLinesIntoFragment(givenArray){
    console.log('givenArray', givenArray)
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
      merged[element].content.sort(this.main.sortArrayNumerically2);
    }
    console.log('sorted:', merged)
    return merged;
  }

     ////////////////////////////
    // HTML RELATED FUNCTIONS //
   ////////////////////////////
  // Allows a fragment to be moved and dropped to create a custom ordering
  moveAndDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.main.selectedEditorArray, event.previousIndex, event.currentIndex);
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
    console.log('hello there!', this.main.booksJSON);
  }

} // CLASS ENDS HERE

// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: './dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

// This class holds all the information necessary for the program to work properly
@Component({
  template: ''
})
export class MainComponent implements OnInit {
  // Import of class used for database communication
  server = new ServerCommunicator(this.httpClient);
  
  authorsJSON : JSON; // JSON that contains all available Authors and their data.
  editorsJSON : JSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON : JSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON : JSON; // JSON that contains all available Bibliography data given a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments : JSON;
  F_Commentary : JSON;
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
  currentBookName : string = "Thyestes";
  // This array contains all the information from a specific book. Functions can use this data.
  FragmentsArray = [];
  selectedEditorArray = [];
  mainEditorArray = [];

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
  this.setCurrentFragmentData(fragmentID);
  // Turn on the spinner.
  this.spinner = true;
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  let F_ReferencerID = await this.server.fetchReferencerID(fragmentID, this.currentEditor, this.currentBook, 'getF_ReferencerID') as JSON;
  // Retrieve the ReferencerID from the data. If not possible, throw error.
  try{
    this.ReferencerID = F_ReferencerID[0][0]; // I am not proud of this one.
    // Retrieves Fragment Commentary
    this.F_Commentary = await this.server.requestCommentary(this.ReferencerID);
    // Retrieves Fragment Differences
    this.F_Differences = await this.server.requestDifferences(this.ReferencerID);
    // Retrieves Fragment Context
    this.F_Context = await this.server.requestContext(this.ReferencerID);
    // Retrieves Fragment Translation
    this.F_Translation = await this.server.requestTranslation(this.ReferencerID);
    // Retrieves Fragment App. Crit.
    this.F_AppCrit = await this.server.requestAppCrit(this.ReferencerID);
    // Retrieves Fragment Reconstruction
    this.F_Reconstruction = await this.server.requestReconstruction(this.ReferencerID);
  }
  catch(e){ // Show error and set F_Commentary to NULL: an error means also no commentary.
    console.log('Cannot find the ReferencerID!');
    this.F_Commentary = JSON;
  }
  // Check if the received commentary is empty. If so, show a banner.
  if(this.isEmpty(this.F_Commentary)){
    this.noCommentary = true;
  }
  else{
    this.noCommentary = false;
  }
  // Turn off spinner at the end
  this.spinner = false;
}

  // sets current fragment number.
  public setCurrentFragmentData(fragment: Number){
    this.currentFragment = fragment;
  } 

  // Function used to set the current Book data given the selected Book array
  public setCurrentBookData(data: Array<string>){
    this.currentBook = data[0];
    this.currentBookName = data[1];
  }

  // Function used to set the current Author data given the selected Author array
  public setCurrentAuthorData(data: Array<string>){
    this.currentAuthor = Number(data[0])
    this.currentAuthorName = data[1];
  }

  /**
  * Adds fragments into an simple array to allow them to be moved on the webpage.
  * This is necessary as moving directly from JSON is not supported by CSS.
  * TODO: I want this for all the other arrays for easy selection.
  * @param none
  * @returns none
  * @author Ycreak
  */
 public tagFragments(array){
  console.log('array', array)
  let taggedArray = [];
  // Push every element in the FragmentsArray
  for(let arrayElement in array){
    taggedArray.push({ 
      lineNumber:   array[arrayElement][1], 
      fragNumber:   array[arrayElement][0],
      lineContent:  array[arrayElement][3], 
      editor:       array[arrayElement][2],
      published:    array[arrayElement][5],
      status:       array[arrayElement][6],
    })
  }
  console.log('taggedArray:', taggedArray)
  return taggedArray;
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



/* @class:    This class communicates with the server
  */
 @Component({
  template: ''
})
 export class ServerCommunicator implements OnInit{
  // Server URL to communicate with database
  serverURL = 'http://katwijk.nolden.biz:5002/';  
  // main = new MainComponent(this.httpClient);

  constructor(private httpClient: HttpClient) { /* empty */ }
    /* @function:     Een get request naar de interface body
   * @return:       De promise van de get request
   * @author:       bors
   */
  ngOnInit() {
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

  // is called to get fragments
  public async requestFragments(book){
    return await this.fetchData(book, 'getFragments') as JSON;
  }  

  // is called to get authors
  public async requestAuthors(book){
    return await this.fetchData(book, 'getAuthors') as JSON;
  }

  // is called to get editors
  public async requestEditors(book){
    return await this.fetchData(book, 'getEditors') as JSON;
  }

  // Request Books by given Author (in the modal)
  public async requestBooks(selectedAuthor: Array<string>){
    return await this.fetchData(selectedAuthor[0], 'getBooks') as JSON;
  }

  // is called to get bib
  public async requestBibliography(book){
    return await this.fetchData(book, 'getBibliography') as JSON;
  } 

  // is called to get commentary
  public async requestCommentary(book){
    return await this.fetchData(book, 'getF_Commentaar') as JSON;
  }  

  // is called to get differences
  public async requestDifferences(book){
    return await this.fetchData(book, 'getF_Differences') as JSON;
  }  

  // is called to get context
  public async requestContext(book){
    return await this.fetchData(book, 'getF_Context') as JSON;
  }  
  
  // is called to get translation
  public async requestTranslation(book){
    return await this.fetchData(book, 'getF_Translation') as JSON;
  }  
  
  // is called to get appcrit
  public async requestAppCrit(book){
    return await this.fetchData(book, 'getF_AppCrit') as JSON;
  }  
  
  // is called to get reconstruction
  public async requestReconstruction(book){
    return await this.fetchData(book, 'getF_Reconstruction') as JSON;
  }    

  
}