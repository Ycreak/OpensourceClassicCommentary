import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import {LoginComponent} from '../login/login.component'
import {TextComponent} from '../text/text.component'

import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { Multiplayer } from './multiplayer.class';

import { Router } from '@angular/router';
// Allows for drag and drop items in HTML
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnd} from '@angular/cdk/drag-drop';
// Library used for interacting with the page
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {Inject, Injectable} from '@angular/core';

import {MatSnackBar} from '@angular/material/snack-bar';
import { Overlay } from '@angular/cdk/overlay';

// To allow dialog windows within the current window
import { TemplateRef, ViewChild } from '@angular/core';
// Imports of different components to be shown within a dialog within the page

// For Firebase communication
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-fragments',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
  columnOneToggle: boolean = true;
  columnTwoToggle: boolean = false; // Boolean to toggle between 2 and 3 column mode.
  columnThreeToggle: boolean = true;
  fourColumnMode: boolean = false;
  Playground: boolean = false;
  Multiplayer_column: boolean = false;
  
  spinner: boolean = true; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.
  // FIXME: proper data types
  authorsJSON; // JSON that contains all available Authors and their data.
  editorsJSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON; // JSON that contains all available Bibliography data given a specific book.
  
  // T_Text;
  // T_TextCommentary
  
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
  currentFragment : string = '';
  currentAuthorName : string = "Ennius";
  currentBookName : string = "Thyestes";
  currentEditorName : string = "TRF";
  // This array contains all the information from a specific book. Functions can use this data.
  selectedEditorArray = [];
  mainEditorArray = [];
  editor1 = [];
  editor2 = [];
  editor3 = [];
  editor4 = [];
  // Work in progress
  playgroundArray = [];
  playgroundArray2 = [];
  fragmentNumberList2;

  referencer : number = 0;
  note;
  noteArray = [];
  addedArray = []; // just trying something
  selectedEditor;
  selectedFragment;
  selectedLine : number;
  fragmentNumberList;
  
  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    private dialog: MatDialog, 
    private _snackBar: MatSnackBar,
    private overlay: Overlay,
    public multiplayer: Multiplayer
    ) { }

  ngOnInit(): void {
    // Request a list of authors to select a different text    
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
    // Retrieves everything surrounding the text. TODO. Needs fixing
    this.RequestEditors(this.currentBook);
    this.RequestFragments(this.currentBook);
    // When init is done, turn off the loading bar (spinner)
    this.spinner = false;  

    //FIXME: this should be handled within the multiplayer class? It wont call the constructor
    this.multiplayer.InitiateFirestore(this.multiplayer.sessionCode, this.multiplayer.tableName); 

  }

  // Opens dialog for the dashboard
  public OpenText() {
    const dialogRef = this.dialog.open(TextComponent);
  }

  public Login() {
    const dialogRef = this.dialog.open(LoginComponent);
  }

  public RequestEditors(book: number){
    this.api.GetEditors(book).subscribe(
      data => {
        // Set the editorsJSON to contain the retrieved data.
        this.editorsJSON = data;
        console.log('json', this.editorsJSON)
        // Select the fragments from the editor you want in the left column.
        this.mainEditorsJSON = this.utility.FilterArrayOnKey(data, 'mainEditor', 1);
        try {
          this.currentEditor = this.mainEditorsJSON[0].id //FIXME:
        }
        catch(e) {
          console.log(e);
        }
      }
    );
  }
 
  public RequestFragments(book: number){
    this.api.GetFragments(book).subscribe(
      data => {
        this.F_Fragments = data;
        this.mainEditorArray = this.CreateEditorArray({id:1}, this.F_Fragments);
        this.selectedEditorArray = this.CreateEditorArray({id:2}, this.F_Fragments); //FIXME: just a quick hack

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

  public PushToArray(note, array){
    array.push(note);
    // console.log(this.tempArray)
    // console.log('noteArray',this.noteArray);
    return array;
  }

  public PopArray(array){
    console.log('ar', array)
    return array.pop();
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
  private CreateEditorArray(editor, array){ 
    console.log('editor', this.currentEditorName)
    // console.log('CreateEditorArray', editor)
    // Filter the given array on the given editor.
    let tempArray = array.filter(x => x.editor == editor.id);
    // Sort the lines numerically.
    tempArray.sort(this.utility.SortArrayNumerically);
    // Merge the different lines into their corresponding fragments
    tempArray = this.utility.MergeLinesIntoFragment(tempArray);
    // Add extra information to every fragment
    for(let i in tempArray){
      tempArray[i].author = this.currentAuthorName;
      tempArray[i].editor = editor.name;
      tempArray[i].text = this.currentBookName;
    }
    console.log('Output', tempArray)
    // Return the fragment with all its fields
    return tempArray;
  }

  /**
  * Retrieves commentaries when a fragment is clicked.
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
 public RequestReferencerID(fragmentName: string, editor: number, book: number){
  console.log('You called! fragment, editor, book: ', fragmentName, editor, book)
  this.currentFragment = fragmentName;
  // Turn on the spinner.
  this.spinner = true;
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  this.api.GetReferencerID(fragmentName, editor, book).subscribe(
    data => {
      data.sort(this.utility.SortNumeric); //FIXME: this must support naming schemes like Warmington.
      let referencer = Math.min.apply(Math, data)
      this.RequestCommentaries(referencer); // The lowest ID is used as a referencer
      return referencer;
    });
 }

public RequestCommentaries(referencer: number){
  // Set commentary available
  this.noCommentary = false;
  // Retrieves Fragment Commentary    
  this.api.GetCommentary(referencer).subscribe(data => this.F_Commentary = data);
  // Retrieves Fragment Differences
  this.api.GetDifferences(referencer).subscribe(data => this.F_Differences = data);
  // Retrieves Fragment Context
  this.api.GetContext(referencer).subscribe(data => this.F_Context = data);
  // Retrieves Fragment Translation
  this.api.GetTranslation(referencer).subscribe(data => this.F_Translation = data);
  // Retrieves Fragment App. Crit.
  this.api.GetApparatus(referencer).subscribe(data => this.F_Apparatus = data);
  // Retrieves Fragment Reconstruction
  this.api.GetReconstruction(referencer).subscribe(data => this.F_Reconstruction = data);
  
  // TODO: check if F_Commentary is empty. If so, set the noCommentary flag to true.
  
  // Turn off spinner at the end
  this.spinner = false;
}

// Quickly stolen from Dashboard. Utility maybe?
public GetFragmentNumbers(editor: number, array){
  // Initialise list
  let list = [];
  // Push all fragment numbers to a list
  for(let key in array){      
    list.push(array[key].fragmentName);
  } 
  // Only take the unique values from this list
  list = this.utility.uniq(list);
  // Sort list numerically
  return list.sort(this.utility.SortNumeric);    
}

//FIXME: this is horrible
public AddFragmentToArray(toAdd, array, fragment){
  console.log(array)
  let tempArray = array.filter(x => x.fragmentName == fragment);
  // console.log('fil', tempArray)
  toAdd = toAdd.concat(tempArray)
  // console.log('added',this.addedArray, this.selectedEditorArray)

  // console.log('add', toAdd)
  // console.log('ply', this.playgroundArray)

  return toAdd;
}


     ////////////////////////////
    // HTML RELATED FUNCTIONS //
   ////////////////////////////
  // Allows a fragment to be moved and dropped to create a custom ordering
  moveAndDrop(event: CdkDragDrop<string[]>, array) {
    moveItemInArray(array, event.previousIndex, event.currentIndex);
    // console.log(this.selectedEditorArray)
  }
  // Opens dialog for the bibliography
  public OpenBibliography() {
    // let dialogRef = this.dialog.open(this.CallBibliography); 
    let dialogRef = this.dialog.open(ShowBibliographyDialog); 

  }
  // Opens dialog to select a new book
  public OpenBookSelect() {
    let dialogRef = this.dialog.open(this.CallBookSelect); 
  }
  // Opens dialog for the about information
  public OpenAbout(): void {
    // const scrollStrategy = this.overlay.scrollStrategies.reposition();

    const dialogRef = this.dialog.open(ShowAboutDialog, 
      {
      autoFocus: false, // To allow scrolling in the dialog
      maxHeight: '90vh' //you can adjust the value as per your view
      });
  }
  // Opens dialog for the dashboard
  // public openDashboard() {
  //   const dialogRef = this.dialog.open(DashboardComponent);
  // }


  
  // PLAYGROUND IMPLEMENTATION. For now not used.
  // public OnDragEnded(event: CdkDragEnd): void {
  //   console.log(event.source.getFreeDragPosition()); // returns { x: 0, y: 0 }
  //   console.log(event.source.getRootElement());
  // }

  // public OnDragEnded(event) {
  //   console.log('Moved in pixels', event.source.getFreeDragPosition()); // returns { x: 0, y: 0 }
  //   let element = event.source.getRootElement();
  //   let boundingClientRect = element.getBoundingClientRect();
  //   let parentPosition = this.GetPosition(element);
  //   console.log('Absolute Position', 'x: ' + (boundingClientRect.x - parentPosition.left), 'y: ' + (boundingClientRect.y - parentPosition.top));        
  //   console.log(event.distance)

  //   console.log(event)
  // }
  
  // public GetPosition(el) {
  //   let x = 0;
  //   let y = 0;
  //   while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
  //     x += el.offsetLeft - el.scrollLeft;
  //     y += el.offsetTop - el.scrollTop;
  //     el = el.offsetParent;
  //   }
  //   return { top: y, left: x };
  // }

  /**
   * Opens Material popup window with the given message
   * FIXME: Should be in Utilities or something, as duplicate in Dashboard.
   * @param message information that is showed in the popup
   */
  public OpenSnackbar(message){
    this._snackBar.open(message, 'Close', {
      // duration: 5000,
    });
  }
  /**
   * Function to handle the error err. Calls Snackbar to show it on screen
   * @param err the generated error
   */
  HandleErrorMessage(err) {
    console.log(err)
    let output = ''
    //TODO: needs to be more sophisticated
    if(err.statusText == 'OK'){
      output = 'Operation succesful.' 
    }
    else{
      output = 'Something went wrong.'
    }
    output = String(err.status) + ': ' + output + ' ' + err.statusText;
    this.OpenSnackbar(output); //FIXME: Spaghetti.
  } 
  /**
   * Opens a confirmation dialog with the provided message
   * @param message shows text about what is happening
   * @param item the item that is about to change
   */
  public OpenConfirmationDialog(message, item): Observable<boolean>{
    const dialogRef = this.dialog.open(ConfirmationDialog2, {
      width: 'auto',
      data: {
        message: message,
        item: item,
      }
    });  
    return dialogRef.afterClosed(); // Returns observable.
  }

}

// // _______        _   
// // |__   __|      | |  
// //    | | _____  _| |_ 
// //    | |/ _ \ \/ / __|
// //    | |  __/>  <| |_ 
// //    |_|\___/_/\_\\__|
    
// class Text{
//   constructor(
//     private api: ApiService,
//     private utility: UtilityService,
//   ){  }

//     T_Text; // I think this should be a JSON

//   public RequestText(book: number){
//     this.api.GetText(book).subscribe(
//       data => {
//         this.T_Text = data;
//       }
//     );  
//   }

//   public RequestCommentary(lineNumber: number){
//     this.selectedLine = lineNumber;
    
//     this.api.GetTextCommentary(this.currentBook, lineNumber).subscribe(
//       data => {
//         this.F_Commentary = data;
//       }
//     );  
//   }

//   public IsWithinScope(commentaarScope : number){
//     if (commentaarScope + 6 > this.selectedLine){
//       return true;
//     } else {
//       return false;
//     }
//   }

//   public CheckEmptyBlock(block : JSON){
//     if(this.utility.IsEmpty(block)) {
//       return true;
//     } else {
//       return false;
//     }
//   }

// }




// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: './dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

@Component({
  selector: 'bibliography-dialog',
  templateUrl: './dialogs/bibliography-dialog.html',
})
export class ShowBibliographyDialog {}

/**
 * Class to show a confirmation dialog when needed. 
 * Shows whatever data is given
 */
@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.html',
})
export class ConfirmationDialog2 {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog2>,
    @Inject(MAT_DIALOG_DATA) public data) { }
  onNoClick(): void {
    this.dialogRef.close();
  }
}