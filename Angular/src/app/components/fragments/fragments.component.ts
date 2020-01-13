import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';

import { TemplateRef, ViewChild } from '@angular/core';

import 'hammerjs';

@Component({
  selector: 'app-interface',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.css'],
})

export class FragmentsComponent implements OnInit {

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

  ReferencerID : Number;

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
  // showFragmentsFalse: boolean = false;
  spinner: boolean = true;

  column1Array = [];
  column2Array = [];
  selectedEditor = <any>{};
  allFragmentsArray = [];

  mainEditorArray = [];
  selectedEditorArray = [];

  mainEditorKey : Number = 1;
  mainEditorName : String = "";
  currentAuthorName : String;
  currentBookName : String;

  serverURL = 'http://katwijk.nolden.biz:5002/';  

  constructor(private modalService: NgbModal, private httpClient: HttpClient, public dialog: MatDialog) { }

  // Please kill this with fire
  public retrieveDataFromJSON(givenJSON : JSON, refJSON : String, column1 : number, column2 : number){
    for(let key in givenJSON){
      if(givenJSON[key][column1] == refJSON){
        var foundEntry = givenJSON[key][column2];
        console.log(foundEntry);
        return foundEntry;
      }
    }
  }

  /* @function:     Loads initial interface: bibliography, editors and the fragments.
   * @author:       Bors & Ycreak
   */
  async ngOnInit() {
    // Request a list of editors from the current text to list in the second column
    this.editors = await this.fetchData(this.currentBook, 'getEditors') as JSON;
    console.log('editors: ',this.editors);
    
    for(let key in this.editors){
      if(this.editors[key][2] == 1){
        this.mainEditorKey = this.editors[key][2];
        this.mainEditorName = this.editors[key][1];
      }
    }
    // Request a list of authors to select a different text
    this.authors = await this.fetchData(this.currentBook, 'getAuthors') as JSON;
    
    for(let key in this.authors){
      if(this.authors[key][0] == this.currentAuthor){
        this.currentAuthorName = this.authors[key][1];
      }
    }

    this.books = await this.fetchData(this.currentAuthor, 'getBooks') as JSON;
    console.log('books: ', this.books)
    this.currentBookName = this.retrieveDataFromJSON(this.books, this.currentBook, 0, 1);
  
    // Request the Bibliography that goes with the given text
    this.bib = await this.fetchData(this.startupBook, 'getBibliography') as JSON;
    // Retrieve all the fragments from the given text
    this.F_Fragments = await this.fetchData(this.startupBook, 'getFragments') as JSON;
    console.log("arrayTemp: ", this.F_Fragments);
    // Create an Array of Objects from these fragments to allow moving them in the second column.
    this.createArrayOfObjects();
    // Turn the retrieved lines into fragments. Builds for the default editor (1).
    this.opbouwenFragmentenEditor("1",1);
    // Create list of FragmentNumbers
    this.getFragmentNumbers();
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
  public async fetchData(currentBook : String, url : String){
    const data = await this.httpClient.get(
      this.serverURL + url,{
        params: {
          currentBook: currentBook.toString(),
        }
      })
      .toPromise();
    return data;  
  }

  // Request Newly Selected Text
  public async requestSelectedText(selectedText: String){
    this.currentBook = selectedText;
    this.F_Fragments = await this.fetchData(selectedText, 'getFragments') as JSON;
    this.createArrayOfObjects();
    this.opbouwenFragmentenEditor("1",1);
    this.bib = await this.fetchData(selectedText, 'getBibliography') as JSON;
    this.currentBookName = this.retrieveDataFromJSON(this.books, this.currentBook, 0, 1);
    // List with Fragment Numbers (for input)
    this.getFragmentNumbers();
  }
  // Request Books by given Author (in the modal)
  public async requestBooks(selectedAuthor: String){
    this.books = await this.fetchData(selectedAuthor, 'getBooks') as JSON;
  }
  

  public async pushComment(fragmentNo, editor, content){

  }

  /**
  * Adds fragments into an simple array to allow them to be moved on the webpage.
  * This is necessary as moving directly from JSON is not supported by CSS.
  * @param none
  * @returns none
  * @author Ycreak
  */
  public createArrayOfObjects(){
    let array = this.F_Fragments
    this.allFragmentsArray = [];
    // Push every element in the allFragmentsArray
    for(let arrayElement in array){
      this.allFragmentsArray.push({ 
        id: array[arrayElement][0], 
        number: array[arrayElement][1], 
        line: array[arrayElement][3], 
        editor: array[arrayElement][2]})
    }
  }

  /**
  * Combines the separate lines from the given array into fragments.
  * @param givenArray with separate lines.
  * @returns array with lines combined into fragment.
  * @author Ycreak
  */
  public combineLinesIntoFragments(givenArray){
    // String that will be used to build the fragment
    let buildString = ""
    // Array that will be used to return a merged array
    var merged = [];
    // For every element in the givenArray, check if it is merged into one fragment.
    for(let element in givenArray){      
      // Check if merged array is exists
      if (Array.isArray(merged) && merged.length) {
        // If it does, check if the fragment already exists
        if(merged.find(el => el.number === givenArray[element].number)){
          // First, find the original string found in the array merged
          buildString = merged.find(el => el.number === givenArray[element].number).line;
          // Save the index to use later to delete the original entry
          const index1 = merged.findIndex((obj => obj.number == givenArray[element].number))
          // Then add the currect string to the original string
          buildString += givenArray[element].line;
          // Remove the old string without the new entry using the index
          merged.splice(index1,1)
          // Push this newly created string to the array merged.
          merged.push({ number: givenArray[element].number, line: buildString, editor: givenArray[element].editor})
        }
        else{ 
          // If the fragment does not exist yet in the array, create the entry and push
          merged.push({ number: givenArray[element].number, line: givenArray[element].line, editor: givenArray[element].editor})
        }
      }
      else{
        // If the array is completely empty, push the element from the givenArray to merged
        merged.push({ number: givenArray[element].number, line: givenArray[element].line, editor: givenArray[element].editor})
      }
    }
    // Return the newly merged array. This has all the separate strings combined in an array
    return merged;
  }

  /**
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */
  public sortArrayNumerically(a, b) {
    // Sort array via the number element given.
    const bandA = a.number;
    const bandB = b.number;
  
    let comparison = 0;
    if (bandA > bandB) {
      comparison = 1;
    } else if (bandA < bandB) {
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
  public opbouwenFragmentenEditor(selectedEditor: String, column: Number){
    let mainEditor = 1; // TODO: Moet nog uit de database halen!
    this.mainEditorKey = mainEditor;
    // Create a mainEditorArray and a selectedEditorArray.
    this.mainEditorArray = this.allFragmentsArray.filter(x => x.editor == mainEditor);
    this.selectedEditorArray = this.allFragmentsArray.filter(x => x.editor == selectedEditor);

    // For every entry in mainEditor Array
    for(var key in this.mainEditorArray){
      // Find the ID tag and save this.
      let idTag = this.mainEditorArray[key].id;
      // Find this ID tag in the selectedEditor Array
      let selectTag = this.selectedEditorArray.find(x => x.id === idTag);
      // And save its index.
      let foundIndex = this.selectedEditorArray.findIndex(x => x.id === idTag);
      // If the selectTag exists, the same line is found in the selectedEditor Array
      if (selectTag != null) {
        // Save this line and check if it is zero (so the same, just subtitute).
        let line = selectTag.line;
        if(line == "0"){
          // If zero, just add the text from the mainEditorArray into the selectedEditorArray
          this.selectedEditorArray[foundIndex].line = this.mainEditorArray[key].line;
        }
        // TODO: else logic. Dont change anything, just leave it (in short).
      }
    }
    // Combine the different lines into fragments.
    this.mainEditorArray = this.combineLinesIntoFragments(this.mainEditorArray);
    this.selectedEditorArray = this.combineLinesIntoFragments(this.selectedEditorArray);

    // Sort the fragments numerically.
    this.mainEditorArray.sort(this.sortArrayNumerically);
    this.selectedEditorArray.sort(this.sortArrayNumerically);
    console.log('mainEditorArray: ', this.mainEditorArray);
  }

  /**
  * Fetches referencerID from the server. Returns this data in a JSON Array. Needs to be
  * combined with the fetchData function (but has different parameters xD)
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
  public async fetchReferencerID(fragmentID: Number, editorID: Number, currentBook : String, url : String){
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
    // Set current fragment number
    this.currentCommentaar = fragmentID;
    // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
    this.F_ReferencerID = await this.fetchReferencerID(fragmentID, editorID, this.currentBook, 'getF_ReferencerID') as JSON;
    // Retrieve the ReferencerID from the data. If not possible, throw error.
    try{
      var ReferencerID = this.F_ReferencerID[0][0];
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
    // Turn off spinner at the end
    this.spinner = false;
  }

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
  openSm(content) {
    this.modalService.open(content, { size: 'sm' });
  }
  // Create a large modal
  openLg(bib1) {
    this.modalService.open(bib1, { windowClass: 'modal-sizer' });
  }
  // Allows a basic modal to be opened
  openBm(content) {
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

  fragmentArray : Array<String> = [];

  tempArray : Array<String>;

  /**
  * Fetches data from the server. Returns this data in a JSON Array.
  * Also takes care of the referencer table (server side).
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
 public async pushFragment(currentBook : String, url : String, fragmentNo : String, editor : String, content : Array<String>){
  const data = await this.httpClient.get(
    this.serverURL + url,{
      params: {
        currentBook: currentBook.toString(),
        fragmentNo : fragmentNo.toString(),
        editor : editor.toString(),
        content : content.toString(),
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

      this.tempArray = this.allFragmentsArray.filter(x => x.number == selectedFragment);
      console.log(this.tempArray);

      // let temp = this.fetchData(this.currentBook, 'getEditors') as JSON;
      // ) as JSON;
    }

  public makeFragment(){
    this.fragmentArray.push('"' + this.given_fragContent + '"@');
    console.log("fragmentArray: ", this.fragmentArray);
  }

  public deleteItemFragmentArray(){
    this.fragmentArray.pop();
  }

  public createFragment() {
    // this.input_selectedEditor = selectedEditor;
    // this.input_FragmentNum = fragmentNum;
    console.log(this.given_Editor);
    this.input_FragmentNum = this.given_fragNum;
    this.input_FragmentContent = this.given_fragContent
    console.log("givenValues: ", this.input_FragmentContent, this.input_FragmentNum);

    // Check all input before sending.
    // TODO

    // console.log(this.currentBook);
    if(this.currentBook == '7'){
      this.pushFragment(this.currentBook, 'insertFragment', this.given_fragNum, this.mainEditorKey.toString(), this.fragmentArray);
    }
    else{
      console.log("THIS BOOK IS PROTECTED");
    }


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
      this.fragmentList.push(this.mainEditorArray[key].number);
    }
  }

  public inputSelectedEditor(selectedEditor : String){
    this.input_selectedEditor = selectedEditor;
    console.log(this.input_selectedEditor);
  }

  public inputSelectedFragment(selectedFragment : String){
    this.input_selectedFragment = selectedFragment;
    console.log(selectedFragment);
  }



}

