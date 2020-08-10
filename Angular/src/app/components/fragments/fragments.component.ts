import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatDialog} from '@angular/material/dialog';

// import {ThemePalette} from '@angular/material/core';
// import {FormControl, FormGroupDirective, FormGroup, NgForm, Validators} from '@angular/forms';
import { TemplateRef, ViewChild } from '@angular/core';
// import { FormBuilder } from '@angular/forms';

import {DashboardComponent} from '../dashboard/dashboard.component'
import {ProfileComponent} from '../profile/profile.component'

import 'hammerjs';

@Component({
  selector: 'app-interface',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.css'],
})
export class FragmentsComponent implements OnInit {

  @ViewChild('callBibliography') callBibliography: TemplateRef<any>; // Note: TemplateRef requires a type parameter for the component reference. In this case, we're passing an `any` type as it's not a component.
  @ViewChild('callBookSelect') callBookSelect: TemplateRef<any>; // Note: TemplateRef requires a type parameter for the component reference. In this case, we're passing an `any` type as it's not a component.
  @ViewChild('callAbout') callAbout: TemplateRef<any>; // Note: TemplateRef requires a type parameter for the component reference. In this case, we're passing an `any` type as it's not a component.

  api : ProfileComponent = new ProfileComponent(this.httpClient, this.modalService);

  // Variables to split the bibliography in different sections.
  bibBooks : JSON;
  bibArticles: JSON;
  bibWebsites: JSON;
  // bibInCollection : JSON; // Maybe add this one yet?
 
  // Toggle switches
  ColumnsToggle: boolean = true; // Boolean to toggle between 2 and 3 column mode.

  selectedEditor = <any>{}; // EHm?
  
  // This array contains all the information from a specific book. Functions can use this data.
  // ArrayWithAllFragments = [];
  // Array with the fragments of the mainEditor (left column) and of the secondary editor (right column)
  mainEditorArray = [];
  selectedEditorArray = []; // This array is filled by the HTML side.

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
    // console.log('a,t', selectedAuthor, selectedText);
    
    // Update current book and author
    this.api.currentBook = selectedText[0];
    this.api.currentBookName = selectedText[1];
    // this.api.currentAuthor = Number(selectedAuthor[0]);
    // this.api.currentAuthorName = selectedAuthor[1];
    // Create the JSON with the Editros for the current book.
    this.api.editorsJSON = await this.api.fetchData(this.api.currentBook, 'getEditors') as JSON;
    // Get new fragments from the selected text.
    this.api.F_Fragments = await this.api.fetchData(this.api.currentBook, 'getFragments') as JSON;
    // Create an array of the retrieved objects to allow them to be moved in CSS.
    this.api.ArrayWithAllFragments = this.api.putFragmentsInMoveableArray(this.api.F_Fragments);   
    // Select the fragments from the editor you want in the left column.
    this.mainEditorArray = this.createEditorArray(this.api.currentEditor, this.api.ArrayWithAllFragments);
    // Retrieve the bibliography corresponding to the text.
    this.api.bibJSON = await this.api.fetchData(this.api.currentBook, 'getBibliography') as JSON;
    this.processBib(this.api.bibJSON);
    // Create a list of main Editors.
    this.api.mainEditorsJSON = this.createMainEditorArray(this.api.editorsJSON)
  }

  // Request Books by given Author (in the modal)
  private async requestBooks(selectedAuthor: Array<string>){
    this.api.currentAuthor = Number(selectedAuthor[0])
    this.api.currentAuthorName = selectedAuthor[1];
    this.api.booksJSON = await this.api.fetchData(selectedAuthor[0], 'getBooks') as JSON;
  }
  
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
    this.api.currentEditor = selectedEditor;
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
    moveItemInArray(this.selectedEditorArray, event.previousIndex, event.currentIndex);
  }
  // Allows a bibliography dialog to be created.
  public openBibliography() {
    let dialogRef = this.dialog.open(this.callBibliography); 
  }
  // Allows a bibliography dialog to be created.
  public openBookSelect() {
    let dialogRef = this.dialog.open(this.callBookSelect); 
  }
  private openAbout() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);
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

  public test(){
    console.log('hello there!', this.api.booksJSON);
  }



} // CLASS ENDS HERE

@Component({
  selector: 'about-dialog',
  templateUrl: 'about-dialog.html',
})
export class DialogContentExampleDialog {}