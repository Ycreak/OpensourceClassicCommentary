import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

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

  @ViewChild('callBibliography') callBibliography: TemplateRef<any>;
  @ViewChild('callBookSelect') callBookSelect: TemplateRef<any>;
  @ViewChild('callAbout') callAbout: TemplateRef<any>;

  // Variables to split the bibliography in different sections.
  bibBooks : JSON;
  bibArticles: JSON;
  bibWebsites: JSON;
  bibInCollection : JSON; //TODO: this one should be added.
  // Toggle switches
  ColumnsToggle: boolean = true; // Boolean to toggle between 2 and 3 column mode.
  // Need to rethink this
  selectedEditor = <any>{}; // EHm?
 
  AuthorsJSON; // JSON that contains all available Authors and their data.
  EditorsJSON; // JSON that contains all available Editors and their data for a specific book.
  MainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON : JSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON : JSON; // JSON that contains all available Bibliography data given a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments;
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
  currentBook : number = 6;
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

  temp;
  temp2; 

  constructor(
    private api: ApiService,
    public dialog: MatDialog, 
    ) { }

  ngOnInit(): void {
  // Request a list of authors to select a different text    
  this.api.GetAuthors().subscribe(data => this.AuthorsJSON = data);
  // Retrieves everything surrounding the text. TODO. Needs fixing
  this.requestSelectedText(this.currentBook);
  // When init is done, turn off the loading bar (spinner)
  this.spinner = false;    
  }

  // Request Newly Selected Text, called on Init and after selecting new text.
  private async requestSelectedText(selectedText: number){  
    // Update current book and author.
    // this.main.setCurrentBookData(selectedText); //FIXME: what to do about this?
    // Create the JSON with the Editors for the current book.
    this.api.GetEditors(selectedText).subscribe(data => this.EditorsJSON = data);
    // Create a list of main Editors from the retrieved editorsJSON.
    this.MainEditorsJSON = this.createMainEditorArray(this.EditorsJSON) //FIXME: needs to await function above 
    // Set the first found main editor as default
    // this.main.currentEditor = this.main.mainEditorsJSON[0][0] //FIXME: this one too
    // Get new fragments from the selected text.
    this.api.GetFragments(selectedText).subscribe(data => this.F_Fragments = data);
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    // this.FragmentsArray = this.tagFragments(this.F_Fragments); //FIXME: probably not needed anymore
    // Select the fragments from the editor you want in the left column.
    // this.main.mainEditorArray = this.createEditorArray(this.main.currentEditor, this.main.FragmentsArray);
    // Retrieve the bibliography corresponding to the text.
    // this.main.bibJSON = await this.server.requestBibliography(this.main.currentBook);
    // Process the retrieved bibliography to appear formatted in the dialog.
    // this.processBib(this.main.bibJSON);
  }

  public test(){
    // console.log(this.authorsJSON)
    console.log('temp', this.temp2)
  }

  // Creates main editor array: the third field has the mainEditor key. Should be named properly.
  private createMainEditorArray(array){
    return array.filter(x => x[2] == 1);
  }

     ////////////////////////////
    // HTML RELATED FUNCTIONS //
   ////////////////////////////
  // Allows a fragment to be moved and dropped to create a custom ordering
  // moveAndDrop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.main.selectedEditorArray, event.previousIndex, event.currentIndex);
  // }
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