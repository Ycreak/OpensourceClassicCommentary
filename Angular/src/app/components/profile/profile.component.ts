import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})



export class ProfileComponent implements OnInit {

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

  // F_ContextTemp = [];
  F_Differences : JSON;
  F_ReferencerID : JSON;
  F_Reconstruction : JSON;

  ReferencerID : string = '0';

  // Variables with currentAuthor, Book and Editor. Placeholder data.
  currentAuthor : Number = 4;
  currentBook : string = '6';
  currentEditor : string = '1';
  currentFragment : Number;

  // These should be retrieved from the database.
  // mainEditorName : String = "TRF";
  currentAuthorName : String = "Ennius";
  currentBookName : String = "Thyestes";

  // This array contains all the information from a specific book. Functions can use this data.
  ArrayWithAllFragments = [];
  selectedEditorArray = [];
  mainEditorArray = [];
  
  serverURL = 'http://katwijk.nolden.biz:5002/';  

  spinner: boolean = true; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.

  constructor(
    private httpClient: HttpClient, 
    private modalService: NgbModal, 
  ) { }

  ngOnInit() {
    
  }

  public test(){
    console.log('hello there!')
    let my = 6;
    return my;
  }

  /**
  * Fetches referencerID from the server. Returns this data in a JSON Array. Needs to be
  * combined with the fetchData function (but has different parameters xD)
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
 public async ophalenCommentaren(fragmentID: Number){
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
  catch(e){
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



  // // Request Books by given Author (in the modal)
  // public async requestBooks(selectedAuthor: Array<string>){
  //   let temp;
  //   temp = await this.fetchData(Number(selectedAuthor[0]), 'getBooks') as JSON;
  //   console.log('result', temp);
  //   return temp;
  // }
  
}

