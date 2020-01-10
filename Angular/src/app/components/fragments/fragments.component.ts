import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { HttpErrorResponse } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms'
// import { getRandomString } from 'selenium-webdriver/safari';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
// import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

// import { MatListModule } from '@angular/material/list';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import {MatExpansionModule} from '@angular/material/expansion';

import 'hammerjs';

// import '@angular/material/prebuilt-themes/deeppurple-amber.css';
// import "../node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css";

@Component({
  selector: 'app-interface',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.css'],
})

export class FragmentsComponent implements OnInit {

  /* @member "api":       Het object dat alle requests behandelt
   * @member "root":      JSON object waarin de interface body in is opgeslagen
   * @member "ready":     Houdt bij of de interface is ingeladen
   * @member "selec...":  Houdt de waarden van de checkboxes bij
   * @member "all_f...":  Heeft alle features van alle modules
   * @member "results":   Heeft alle features gevonden door search
   */
  api : APIComponent;
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
  spinner: boolean = true;

  column1Array = [];
  column2Array = [];
  selectedEditor = <any>{};
  // Contains all data for the build of fragments to show.
  allFragmentsArray = [];

  mainEditorArray = [];
  selectedEditorArray = [];

  /* @member "abt_code":  De string welke de abt_code voorstelt, te tonen in de popup modal
   */
  // abt_code : string;

  constructor(private modalService: NgbModal, private httpClient: HttpClient) { }

  /* @function:     Laadt interface in
   * @author:       bors
   */
  async ngOnInit() {
    this.requestEditors(this.currentBook);

    this.global();
    this.requestBibliography();
  }

  // This will have to be removed ASAP.
  public delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  // Attempt to get Async working.
  async global(){
    await this.requestFragments(this.startupBook);
    
    await this.delay(2000);
    this.spinner = false;

    this.createArrayOfObjects();
    // Retrieve Default Editor
    this.opbouwenFragmentenEditor("1",1);
  }

  public requestFragments(currentBook: String){
    // this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getFragments(currentBook)
          .then(result => {
            this.F_Fragments = result as JSON;
            this.getString(this.F_Fragments);
            this.ready = true;
          })
          .catch(error => console.log(error));
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
    // Push every element in the allFragmentsArray
    for(let arrayElement in array){
      this.allFragmentsArray.push({ id: array[arrayElement][0], number: array[arrayElement][1], line: array[arrayElement][3], editor: array[arrayElement][2]})
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

    // Create a mainEditorArray and a selectedEditorArray.
    this.mainEditorArray = this.allFragmentsArray.filter(x => x.editor == mainEditor);
    this.selectedEditorArray = this.allFragmentsArray.filter(x => x.editor == selectedEditor);

    // For every entry in mainEditor Array
    for(var key in this.mainEditorArray){
      console.log('key: ', this.mainEditorArray[key].id);
      // Find the ID tag and save this.
      let idTag = this.mainEditorArray[key].id;
      // Find this ID tag in the selectedEditor Array
      let selectTag = this.selectedEditorArray.find(x => x.id === idTag);
      // And save its index.
      let foundIndex = this.selectedEditorArray.findIndex(x => x.id === idTag);
      console.log('SelectTag: ', selectTag, 'foundIndex: ', foundIndex);
      // If the selectTag exists, the same line is found in the selectedEditor Array
      if (selectTag != null) {
        // Save this line and check if it is zero (so the same, just subtitute).
        let line = selectTag.line;
        console.log(line)
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
  }

  public requestF_ReferencerID(fragmentID: Number, editorID: Number, currentBook: String){
    console.log("F_Commentaar requested!");
    // this.selectedLine = +requestedLine;
    console.log('data: ', fragmentID, editorID, currentBook);
    this.api = new APIComponent(this.httpClient);
    this.api
          .getF_ReferencerID(fragmentID, editorID, currentBook)
          .then(result => {
            this.F_ReferencerID = result as JSON;
            this.getString(this.F_ReferencerID);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  async requestItem(givenJSON: JSON, currentBook: String){
    this.api = new APIComponent(this.httpClient);
    this.api
      .getItem(currentBook)
      .then(result => {
        givenJSON = result as JSON;
        // this.getString(givenJSON);
        this.ready = true;
        console.log('givenJSON ', givenJSON);


      })
      .catch(error => console.log(error));
      return givenJSON;    

  }

  public requestF_Commentaar(currentBook: String){
    // this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getF_Commentaar(currentBook)
          .then(result => {
            this.F_Commentaar = result as JSON;
            this.getString(this.F_Commentaar);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestF_Context(currentBook: String){
    // this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getF_Context(currentBook)
          .then(result => {
            this.F_Context = result as JSON;
            this.getString(this.F_Context);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestF_AppCrit(currentBook: String){
    // this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getF_AppCrit(currentBook)
          .then(result => {
            this.F_AppCrit = result as JSON;
            this.getString(this.F_AppCrit);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestF_Translation(currentBook: String){
    // this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getF_Translation(currentBook)
          .then(result => {
            this.F_Translation = result as JSON;
            this.getString(this.F_Translation);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestF_Differences(currentBook: String){
    // this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getF_Differences(currentBook)
          .then(result => {
            this.F_Differences = result as JSON;
            this.getString(this.F_Differences);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestAuthors(){
    this.api = new APIComponent(this.httpClient);
    this.api
          .getAuthors()
          .then(result => {
            this.authors = result as JSON;
            this.getString(this.authors);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestEditors(currentBook: String){
    //this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getEditors(currentBook)
          .then(result => {
            this.editors = result as JSON;
            this.getString(this.editors);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestBibliography(){
    this.api = new APIComponent(this.httpClient);
    this.api
          .getBibliography(this.currentBook)
          .then(result => {
            this.bib = result as JSON;
            this.getString(this.bib);
            this.ready = true;
            console.log("Bib requested")
          })
          .catch(error => console.log(error));
  }

  public requestBooks(authorEntry : String){
    this.api = new APIComponent(this.httpClient);
    this.api
          .getBooks(authorEntry)
          .then(result => {
            this.books = result as JSON;
            this.getString(this.books);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }


  async ophalenCommentaren(fragmentID: Number, editorID: Number){
    this.currentCommentaar = fragmentID;
    this.spinner = true;

    this.requestF_ReferencerID(fragmentID, editorID, this.currentBook);
    await this.delay(2000);
    // var hello;
    // console.log('JSON: ', this.F_ReferencerID[0]);

    console.log('F_REFERENCER: ', this.F_ReferencerID[0][0]);


    try{
      var ReferencerID = this.F_ReferencerID[0][0]
    }
    catch(e){
      console.log('wrong!')
    }

          // ophalen Commentaar
    let tempItem: JSON;
    tempItem = await this.requestItem(this.F_Commentaar, ReferencerID);
    // await this.delay(2000);
    console.log('tempItem: ',tempItem);

    // console.log(this.F_Commentaar);
    
    // this.requestF_Commentaar(ReferencerID);

    // ophalen AppCrit
    this.requestF_AppCrit(ReferencerID);

    // ophalen Context
    // console.log('Getting Context!');
    this.requestF_Context(ReferencerID);

    this.requestF_Differences(ReferencerID);
    // console.log("root: ", gegevenRegel, this.root[1]);

    this.requestF_Translation(ReferencerID);
    // this.F_ReferencerID = {};



    // console.log('Referencer: ', json);




    this.spinner = false;

  }

  // Pressing the arrow will expand an expansionpanel.
  public expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.close(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';

    return (target['classList'] && target['classList'].contains(expansionIndicatorClass) );
  }


  drop1(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedEditorArray, event.previousIndex, event.currentIndex);
  }
  // public drop(event: any): void {
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   }
  //   else {
  //     transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
  //   }
  // }

  public switchMode(){
    this.fragments = true;
    console.log(this.fragments);
  }

  public getString(insertedJSON: JSON){
    return JSON.stringify(insertedJSON);
  }

  public onSubmit(f: NgForm) {
    console.log(f.value.first);
    // console.log(f.value);
  }

  public showInfo(temp1: Array<string>){
    console.log(temp1);
  }

  public testFunction(){
    console.log('de testfunctie is aangeroepen!')
  }


  openSm(content) {
    this.modalService.open(content, { size: 'sm' });
  }

  openLg(bib1) {
    this.modalService.open(bib1, { windowClass: 'modal-sizer' });
  }

  public isValidFoo(commentaarScope : number){
    console.log("scope", commentaarScope)
    if (commentaarScope + 6 > this.selectedLine){
      return true;
    } else {
      return false;
    }
  }

  public isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

  public checkEmptyBlock(temp : JSON){
    // console.log("hi", temp)
    if(this.isEmpty(temp)) {
      // console.log("empty");// Object is empty (Would return true in this example)
      return true;
    } else {
      // console.log("not empty");
      return false;
    }

  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}

  /* @class:    Deze component neemt alle requests (API) voor zijn rekening
   */
class APIComponent {

  constructor(private httpClient: HttpClient) { /* empty */ }

  /* @function:     Haalt de primaire text op.
   * @return:       De promise van de get request.
   * @author:       Bors & Nolden.
   */
  public getFragments(currentBook : String) : Promise<any> {
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getFragments',{
              params: {
                currentBook: currentBook.toString(),
              }
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  /* @function:     Een get request naar de abt code
   * @param "list": Een lijst met namen van features
   * @return:       De promise van de get request
   * @author:       Bors & Nolden.
   */
  public getF_ReferencerID(fragmentID: Number, editorID: Number, currentBook: String) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getF_ReferencerID', {
              params: {
                fragmentID: fragmentID.toString(),
                editorID: editorID.toString(),
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getItem(currentBook : String) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getF_Commentaar', {
              params: {
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getF_Commentaar(currentBook : String) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getF_Commentaar', {
              params: {
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getF_AppCrit(currentBook : String) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getF_AppCrit', {
              params: {
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getF_Translation(currentBook : String) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getF_Translation', {
              params: {
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }


  public getF_Context(currentBook : String) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getF_Context', {
              params: {
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getF_Differences(currentBook : String) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getF_Differences', {
              params: {
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getAuthors() : Promise<any> {
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getAuthors')
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getEditors(currentBook : String) : Promise<any> {
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getEditors',{
              params: {
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getBooks(authorEntry : String) : Promise<any> {
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getBooks', {
              params: {
                authorEntry: authorEntry.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getBibliography(currentText : String) : Promise<any> {
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getBibliography', {
              params: {
                currentText: currentText.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  /* @function:     Bepaalt wat teruggeven wordt
   * @param "res":  Een response van de request
   * @return:       Data of een leeg object
   * @author:       Bors
   */
  private extractData(res: Response) : {} {
    console.log('The requested array is listed in the next line!');
    console.log(res);
    return res || {};
  }

  /* @function:     Error afhandeling na mislukte request
   * @param "error" Een lijst met namen van features
   * @return:       De gerejecte promise
   * @author:       bors
   */
  private handleError(error: any) : Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
