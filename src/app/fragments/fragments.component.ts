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

  @ViewChild('callBibliography') callBibliography: TemplateRef<any>;
  @ViewChild('callBookSelect') callBookSelect: TemplateRef<any>;
  @ViewChild('callAbout') callAbout: TemplateRef<any>;

  // Variables to split the bibliography in different sections.
  bibBooks : JSON;
  bibArticles: JSON;
  bibWebsites: JSON;
  bibInCollection : JSON; //TODO: this one should be added.
  // Toggle switches
  columnsToggle: boolean = true; // Boolean to toggle between 2 and 3 column mode.
  // Need to rethink this
  selectedEditor = <any>{}; // EHm?
 
  authorsJSON; // JSON that contains all available Authors and their data.
  editorsJSON; // JSON that contains all available Editors and their data for a specific book.
  mainEditorsJSON : JSON; // JSON that contains all available main Editors and their data for a specific book.
  booksJSON : JSON; // JSON that contains all available Books and their data given a specific editor.
  bibJSON : JSON; // JSON that contains all available Bibliography data given a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  F_Fragments;
  F_Commentary;
  F_AppCrit;
  F_Translation;
  F_Context;
  F_ContextField : String;
  F_Content;
  F_Differences;
  F_ReferencerID;
  F_Reconstruction;
  // This variable holds the link between the commentaries and the selected fragment
  ReferencerID : string = '0';
  // Variables with currentAuthor, Book and Editor. Placeholder data.
  currentAuthor : number = 4;
  currentBook : number = 6;
  currentEditor : number = 1;
  currentFragment : Number;
  currentAuthorName : String = "Ennius";
  currentBookName : string = "Thyestes";
  // This array contains all the information from a specific book. Functions can use this data.
  fragmentsArray = [];
  selectedEditorArray = [];
  mainEditorArray = [];

  spinner: boolean = true; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.

  temp;
  temp2; 

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    private dialog: MatDialog, 
    ) { }

  ngOnInit(): void {
  // Request a list of authors to select a different text    
  this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
  // Retrieves everything surrounding the text. TODO. Needs fixing
  this.requestSelectedText(this.currentBook);
  // When init is done, turn off the loading bar (spinner)
  this.spinner = false;    
  }

  // Request Newly Selected Text, called on Init and after selecting new text.
  private async requestSelectedText(book: number){  
    // Create the JSON with the Editors for the current book.
    this.api.GetEditors(book).subscribe(
      data => {
        // Set the editorsJSON to contain the retrieved data.
        this.editorsJSON = data;
        // Create a list of main Editors from the retrieved editorsJSON.
        this.mainEditorsJSON = this.createMainEditorArray(data);
        this.currentEditor = this.mainEditorsJSON[0].id //FIXME:
      });
    // Get new fragments from the selected text.
    this.api.GetFragments(book).subscribe(
      data => {
        this.F_Fragments = data;
        this.mainEditorArray = this.createEditorArray(1, this.F_Fragments);
      });
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    // this.FragmentsArray = this.tagFragments(this.F_Fragments); //FIXME: probably not needed anymore
    // Select the fragments from the editor you want in the left column.
    // this.mainEditorArray = this.createEditorArray(this.currentEditor, this.F_Fragments);
    
    // Retrieve the bibliography corresponding to the text. FIXME: I need the entire bib for a book here, not just an entry
    // this.main.bibJSON = await this.server.requestBibliography(this.main.currentBook);
    // Process the retrieved bibliography to appear formatted in the dialog.
    // this.processBib(this.main.bibJSON);
  }

  public test(thing){
    // console.log(this.authorsJSON)
    console.log('test', thing)
  }

  /**
  * Creates fragments for the main editor and the selected editor
  * @param selectedEditor given from the middle column
  * @returns none
  * @author Ycreak
  */
  private createEditorArray(editor: number, array){
    // Filter the given array on the given editor.
    let tempArray = array.filter(x => x.editor == editor);
    // Sort the lines numerically.
    tempArray.sort(this.utility.SortNumeric);
    // Merge the different lines into their corresponding fragments
    return this.mergeLinesIntoFragment(tempArray);
  }

  // Creates main editor array: the third field has the mainEditor key. Should be named properly.
  private createMainEditorArray(array){
    console.log('createMainEditorArray', array);
    return array.filter(x => x.defaultEditor == 1);
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
    var tempContent = [];

    // For every element in the givenArray, check if it is merged into one fragment.
    for(let element in givenArray){ 
      let fragNum = givenArray[element].fragmentName;
      let lineNum = givenArray[element].lineName;
      let lineCont = givenArray[element].fragmentContent;
      let stat = givenArray[element].status  
      let buildString = '<p>' + lineNum + ': ' + lineCont + '</p>';

      console.log(fragNum, lineNum, lineCont);

      // Push the first item always, as the array is empty.
      contentObject.push({
        lineName: lineNum,
        fragmentContent: lineCont,
        lineComplete: buildString,
      })

      merged.push({ fragmentName: givenArray[element].fragmentName, content: contentObject, status: stat})
      contentObject = [];
      console.log('init', merged)

    //   // Check if array has at least one element.
    //   if (Array.isArray(merged) && merged.length) {
    //     // Check if a new fragment needs to be created, or if there should be a merge
    //     if(merged.find(el => el.fragmentName === fragNum)){
    //       console.log('fragnum', fragNum)
    //       // Fragment already present, merging.
    //       let foundFragment = merged.find(el => el.fragmentName === fragNum)
    //       console.log('foundFragment', foundFragment)
    //       tempContent = foundFragment.content[0].fragmentContent;
    //       console.log('tempcontent', tempContent)
    //       tempContent.push({
    //         lineName: lineNum,
    //         fragmentContent: lineCont,
    //         lineComplete: buildString,
    //       })

    //       // Horrible code to find the current merge entry to be deleted.
    //       const index1 = merged.findIndex((el => el.fragmentName === fragNum))
    //       merged.splice(index1,1)

    //       merged.push({ fragmentName: fragNum, content: tempContent, status: stat})

    //       contentObject = [];
    //     }
    //     else{
    //       // Fragment to be created
    //       contentObject.push({
    //         lineName: lineNum,
    //         fragmentContent: lineCont,
    //         lineComplete: buildString,
    //       })
          
    //       merged.push({ fragmentName: fragNum, content: contentObject, status: stat})

    //       contentObject = [];
    //     }
    //   }
    //   else{    
    //     // Push the first item always, as the array is empty.
    //     contentObject.push({
    //       lineName: lineNum,
    //       fragmentContent: lineCont,
    //       lineComplete: buildString,
    //     })

    //     merged.push({ fragmentName: givenArray[element].fragmentName, content: contentObject, status: stat})
    //     contentObject = [];
    //     console.log('init', merged)
    //   }     
    }
    // Sort the lines in merged, needs to be own function
    for(let element in merged){
      merged[element].content.sort(this.utility.SortNumeric);
    }
    console.log('sorted:', merged)
    return merged;
  }

  /**
  * Retrieves commentaries when a fragment is clicked.
  * @param fragmentID which identifies which fragment is clicked
  * @editorID ???
  * @returns none
  * @author Ycreak
  */
 public retrieveReferencerID(fragmentID: number){
  console.log('fragment, editor, book: ', fragmentID, this.currentEditor, this.currentBook)
  // Turn on the spinner.
  this.spinner = true;
  // Retrieve the Referencer ID and wait before it is retrieved before proceeding with the rest.
  this.api.GetReferencerID(fragmentID, this.currentEditor, this.currentBook).subscribe(
    data => {
      let F_ReferencerID = data;
      let numberRef = Number(F_ReferencerID[0]);
      this.retrieveCommentaries(numberRef) // FIXME: must be number
    });
 }

public retrieveCommentaries(referencerID: number){ //FIXME: must be number
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
    this.api.GetAppCrit(referencerID).subscribe(data => this.F_AppCrit = data);
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