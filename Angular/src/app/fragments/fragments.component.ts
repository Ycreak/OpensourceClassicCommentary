import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
// Allows for drag and drop items in HTML
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
// Library used for interacting with the page
import {MatDialog} from '@angular/material/dialog';
// To allow dialog windows within the current window
import { TemplateRef, ViewChild } from '@angular/core';
// Imports of different components to be shown within a dialog within the page

@Component({
  selector: 'app-fragments',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.scss']
})
export class FragmentsComponent implements OnInit {

  @ViewChild('CallBibliography') CallBibliography: TemplateRef<any>;
  @ViewChild('CallBookSelect') CallBookSelect: TemplateRef<any>;
  @ViewChild('CallAbout') CallAbout: TemplateRef<any>;

  // Variables to split the bibliography in different sections.
  bibBooks : JSON;
  bibArticles: JSON;
  bibWebsites: JSON;
  bibInCollection : JSON; //TODO: this one should be added.
  // Toggle switches
  columnsToggle: boolean = true; // Boolean to toggle between 2 and 3 column mode.
  spinner: boolean = true; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.
  // FIXME: proper data types
  authorsJSON; // JSON that contains all available Authors and their data.
  editorsJSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON; // JSON that contains all available Bibliography data given a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments;
  F_Commentary;
  F_Apparatus;
  F_Translation;
  F_Context;
  F_Differences;
  F_ReferencerID;
  F_Reconstruction;
  // Variables with currentAuthor, Book and Editor. Mostly placeholder data.
  currentAuthor : number = 4;
  currentBook : number = 6;
  currentEditor : number = 1;
  currentFragment : number;
  currentAuthorName : string = "Ennius";
  currentBookName : string = "Thyestes";
  currentEditorName : string = "Manuwald";
  // This array contains all the information from a specific book. Functions can use this data.
  selectedEditorArray = [];
  mainEditorArray = [];

  Referencer;

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    private dialog: MatDialog, 
    ) { }

  ngOnInit(): void {
  // Request a list of authors to select a different text    
  this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
  // Retrieves everything surrounding the text. TODO. Needs fixing
  this.RequestEditors(this.currentBook);
  this.RequestFragments(this.currentBook);
  // When init is done, turn off the loading bar (spinner)
  this.spinner = false;    
  }

  public RequestEditors(book: number){
    this.api.GetEditors(book).subscribe(
      data => {
        // Set the editorsJSON to contain the retrieved data.
        this.editorsJSON = data;
        // Select the fragments from the editor you want in the left column.
        this.mainEditorsJSON = this.CreateMainEditorArray(data);
        this.currentEditor = this.mainEditorsJSON[0].id //FIXME:
      }
    );
  }
 
  public RequestFragments(book: number){
    this.api.GetFragments(book).subscribe(
      data => {
        this.F_Fragments = data;
        this.mainEditorArray = this.CreateEditorArray(1, this.F_Fragments);
      }
    );  
  }

  public RequestBooks(author: number){
    this.api.GetBooks(author).subscribe(
      data => {
        this.booksJSON = data;
        console.log(data);
      }
    );      
  }

  // Request Newly Selected Text, called on Init and after selecting new text.
  public RequestBibliography(book: number){  
    // Retrieve the bibliography corresponding to the text. FIXME: I need the entire bib for a book here, not just an entry
    // this.main.bibJSON = await this.server.requestBibliography(this.main.currentBook);
    // Process the retrieved bibliography to appear formatted in the dialog.
    // this.processBib(this.main.bibJSON);
  }

  public Test(thing){
    // console.log(this.authorsJSON)
    console.log('test', thing)
  }

  // Function used to set the current Author data given the selected Author array
  public SetCurrentAuthorData(data){
    this.currentAuthor = data.id
    this.currentAuthorName = data.name;
  }

  // Function used to set the current Book data given the selected Book array
  public SetCurrentBookData(data){
    this.currentBook = data.id;
    this.currentBookName = data.title;
  }

  // Function used to set the current Book data given the selected Book array
  public SetCurrentEditorData(data){
    this.currentEditor = data.id;
    this.currentEditorName = data.name;
  }

  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  private CreateEditorArray(editor: number, array){
    // console.log('CreateEditorArray', editor)
    // Filter the given array on the given editor.
    let tempArray = array.filter(x => x.editor == editor);
    // Sort the lines numerically.
    tempArray.sort(this.utility.SortArrayNumerically);
    // Merge the different lines into their corresponding fragments
    return this.utility.MergeLinesIntoFragment(tempArray);
  }

  // Creates main editor array: the third field has the mainEditor key. Should be named properly.
  private CreateMainEditorArray(array){
    // console.log('createMainEditorArray', array);
    return array.filter(x => x.mainEditor == 1);
  }

  /**
  * Retrieves commentaries when a fragment is clicked. DEPRECATED
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
 public RequestReferencerID(fragment: number, editor: number, book: number){
  console.log('fragment, editor, book: ', fragment, editor, book)
  // Turn on the spinner.
  this.spinner = true;
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  this.api.GetReferencerID(fragment, editor, book).subscribe(
    data => {
      let F_ReferencerID = data;
      console.log('OldReferencer', F_ReferencerID[0])
      this.RequestCommentaries(Number(F_ReferencerID[0]))// FIXME: not very elegant
    });
 }

  /**
  * Retrieves commentaries when a fragment is clicked.
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
 public RequestReferencerID2(fragmentName: string, editor: number, book: number){
  console.log('You called! fragment, editor, book: ', fragmentName, editor, book)
  // Turn on the spinner.
  this.spinner = true;
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  this.api.GetReferencerID2(fragmentName, editor, book).subscribe(
    data => {
      let F_ReferencerID = data;
      console.log('new', F_ReferencerID)
      // console.log(data.))
      data.sort(this.utility.SortNumeric); //FIXME: this must support naming schemes like Warmington.
      this.RequestCommentaries(Math.min.apply(Math, data)); // The lowest ID is used as a referencer
      // return Math.min.apply(Math, data);
    });
 }

public RequestCommentaries(referencerID: number){ //FIXME: must be number
  // Check if ReferencerID is valid. If not, no commentary available
  if (Number.isNaN(referencerID)){
    this.noCommentary = true;
  }
  else{
    // Set commentary available
    this.noCommentary = false;
    // Retrieves Fragment Commentary    
    this.api.GetCommentary(referencerID).subscribe(data => this.F_Commentary = data);
    // Retrieves Fragment Differences
    this.api.GetDifferences(referencerID).subscribe(data => this.F_Differences = data);
    // Retrieves Fragment Context
    this.api.GetContext(referencerID).subscribe(data => this.F_Context = data);
    // Retrieves Fragment Translation
    this.api.GetTranslation(referencerID).subscribe(data => this.F_Translation = data);
    // Retrieves Fragment App. Crit.
    this.api.GetApparatus(referencerID).subscribe(data => this.F_Apparatus = data);
    // Retrieves Fragment Reconstruction
    this.api.GetReconstruction(referencerID).subscribe(data => this.F_Reconstruction = data);
  }
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
  // Opens dialog for the bibliography
  public OpenBibliography() {
    let dialogRef = this.dialog.open(this.CallBibliography); 
  }
  // Opens dialog to select a new book
  public OpenBookSelect() {
    let dialogRef = this.dialog.open(this.CallBookSelect); 
  }
  // Opens dialog for the about information
  public OpenAbout() {
    const dialogRef = this.dialog.open(ShowAboutDialog);
  }
  // Opens dialog for the dashboard
  // public openDashboard() {
  //   const dialogRef = this.dialog.open(DashboardComponent);
  // }
}

// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: './dialogs/about-dialog.html',
})
export class ShowAboutDialog {}