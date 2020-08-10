import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';

import {ThemePalette} from '@angular/material/core';
import {FormControl, FormGroupDirective, FormGroup, NgForm, Validators} from '@angular/forms';
import { TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import {DashboardComponent} from '../dashboard/dashboard.component'
import {ProfileComponent} from '../profile/profile.component'

import 'hammerjs';

// export interface Task {
//   name: string;
//   completed: boolean;
//   color: ThemePalette;
//   subtasks?: Task[];
// }


// // Imports navbar from file Navbar
// @Component({
//   selector: 'app-navbar',
//   // templateUrl: './header.html',
//   // styleUrls: ['./fragments.component.css'],
// })
// export class DeviceComponent {}

@Component({
  selector: 'app-interface',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.css'],
})
export class FragmentsComponent implements OnInit {

  @ViewChild('callBibliography') callBibliography: TemplateRef<any>; // Note: TemplateRef requires a type parameter for the component reference. In this case, we're passing an `any` type as it's not a component.

  api : ProfileComponent = new ProfileComponent(this.httpClient, this.modalService);

  authorsJSON : JSON; // JSON that contains all available Authors and their data.
  editorsJSON : JSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON : JSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON : JSON; // JSON that contains all available Bibliography data given a specific book.

  bibBooks : JSON;
  bibArticles: JSON;
  bibWebsites: JSON;

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
  
  // ID that links a specific fragment to its commentary. Used in the database.
  ReferencerID : Number;

  // List with all the fragments numbers. Used to select a specific fragment for a specific editor.
  fragmentNumberList : Array<Number>;

  // Variables with currentAuthor, Book and Editor. Placeholder data.
  currentAuthor : Number = 4;
  currentBook : string = '6';
  currentEditor : string = '1';
  currentFragment : Number;
  
  // Does this have to do with the Bibliography modal?
  panelOpenState: boolean = false;
  allExpandState = true;

  ColumnsToggle: boolean = true; // Boolean to toggle between 2 and 3 column mode.
  spinner: boolean = true; // Boolean to toggle the spinner.

  noCommentary: boolean = false;

  selectedEditor = <any>{};
  
  // This array contains all the information from a specific book. Functions can use this data.
  ArrayWithAllFragments = [];

  // Array with the fragments of the mainEditor (left column) and of the secondary editor (right column)
  mainEditorArray = [];
  fixedMainEditorArray = [];

  selectedEditorArray = [];

  // These should be retrieved from the database.
  mainEditorName : String = "TRF";
  currentAuthorName : String = "Ennius";
  currentBookName : String = "Thyestes";

  // URL for the server.
  serverURL : string = 'http://katwijk.nolden.biz:5002/';  

  constructor(
    private modalService: NgbModal, 
    private httpClient: HttpClient, 
    public dialog: MatDialog, 
    ) { }

  public openDashboard() {
    const dialogRef = this.dialog.open(DashboardComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  // public openBibliography() {
  //   const dialogRef = this.dialog.open(DialogContentExampleDialog);

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }

  /* @function:     Loads initial interface: bibliography, editors and the fragments.
   * @author:       Bors & Ycreak
   */
  async ngOnInit() {
    // Request a list of editors from the current text to list in the second column
    this.editorsJSON = await this.api.fetchData(this.currentBook, 'getEditors') as JSON;
       
    // Request a list of authors to select a different text
    this.authorsJSON = await this.api.fetchData(this.currentBook, 'getAuthors') as JSON;
    
    // Retrieves everything surrounding the text. TODO. Needs fixing
    this.requestSelectedText(['4','Ennius'], ['6','Thyestes']);
 
    // When init is done, turn off the loading bar (spinner)
    this.spinner = false;

  }

  // Request Newly Selected Text, called on Init and after selecting new text.
  private async requestSelectedText(selectedAuthor: Array<String>, selectedText: Array<string>){
    // Update current book and author
    this.currentBook = selectedText[0];
    this.currentBookName = selectedText[1];
    this.currentAuthor = Number(selectedAuthor[0]);
    this.currentAuthorName = selectedAuthor[1];
    // Create the JSON with the Editros for the current book.
    this.editorsJSON = await this.api.fetchData(this.currentBook, 'getEditors') as JSON;
    // Get new fragments from the selected text.
    this.F_Fragments = await this.api.fetchData(this.currentBook, 'getFragments') as JSON;
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    this.ArrayWithAllFragments = this.putFragmentsInMoveableArray(this.F_Fragments);
    // Select the fragments from the editor you want in the left column.
    this.mainEditorArray = this.createEditorArray(this.currentEditor, this.ArrayWithAllFragments);
    // Retrieve the bibliography corresponding to the text.
    this.bibJSON = await this.api.fetchData(this.currentBook, 'getBibliography') as JSON;
    this.processBib(this.bibJSON);
    // Create a list of main Editors.
    this.mainEditorsJSON = this.createMainEditorArray(this.editorsJSON)
  }

  // Request Books by given Author (in the modal)
  private async requestBooks(selectedAuthor: Array<string>){
    this.booksJSON = await this.api.fetchData(selectedAuthor[0], 'getBooks') as JSON;
  }
  
  private processBib(bib){
    this.bibArticles = bib.filter(x => x[3] !== null);
    this.bibBooks = bib.filter(x => x[2] !== null);
    this.bibWebsites = bib.filter(x => x[10] !== null);
  }

  /**
  * Adds fragments into an simple array to allow them to be moved on the webpage.
  * This is necessary as moving directly from JSON is not supported by CSS.
  * TODO: I want this for all the other arrays for easy selection.
  * @param none
  * @returns none
  * @author Ycreak
  */
  private putFragmentsInMoveableArray(array){
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

  // This function merges the multiple lines in a single fragment.
  // The structure looks as follows: Fragment 2, [[1, "hello"],[2,"hi"]]
  // Function way to long... Function in function needed here.
  public mergeLinesIntoFragment(givenArray){
    console.warn('start of the function')
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
    this.currentEditor = selectedEditor;
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

  /**
  * Retrieves commentaries when a fragment is clicked.
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
  async ophalenCommentaren(fragmentID: Number){
    console.log(fragmentID, this.currentEditor, this.currentBook)
    this.currentFragment = fragmentID;
    // Turn on the spinner.
    this.spinner = true;
    // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
    let F_ReferencerID = await this.api.fetchReferencerID(fragmentID, this.currentEditor, this.currentBook, 'getF_ReferencerID') as JSON;
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
      // Turn off spinner at the end
    }
    catch(e){
      console.log('Cannot find the ReferencerID!');
      this.F_Commentaar = JSON;
    }

    // Check if the received commentary is empty. If so, show a banner.
    if(this.api.isEmpty(this.F_Commentaar)){
      this.noCommentary = true;
    }
    else{
      this.noCommentary = false;
    }
    this.spinner = false;
  }

     ////////////////////////////
    // HTML RELATED FUNCTIONS //
   ////////////////////////////
  // Allows a fragment to be moved and dropped to create a custom ordering
  moveAndDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedEditorArray, event.previousIndex, event.currentIndex);
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

  public openBibliography() {
    let dialogRef = this.dialog.open(this.callBibliography);
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

  public test(){
    console.log('hello there!', this.booksJSON);
  }

} // CLASS ENDS HERE
