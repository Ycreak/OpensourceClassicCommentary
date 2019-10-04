import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms'
import { getRandomString } from 'selenium-webdriver/safari';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';

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
  commentaar : JSON;
  temp : Array<string> = [];
  books : JSON;
  bib : JSON;
  commentaar2 : JSON;
  commentaar2_deels : Array<string>;

  F_Commentaar : JSON;
  F_AppCrit : JSON;
  F_Context : JSON;
  F_ContextTemp = [];

  requestedItem : Array<String>;
  // requestedJSON : JSON;

  ready : boolean = false;
  results : string[] = [];
  closeResult: string;

  stringArray : Array<string> = [];

  givenText : Array<string> = [];

  currentAuthor : Array<string> = ['4'];
  currentBook : Array<string> = ['6'];
  startupBook : Array<string> = ['6'];

  selectedLine : number = 0;
  gegevenRegel : number = 0;

  panelOpenState: boolean = false;
  allExpandState = true;

  fragments : boolean = false;
  list1 = [];

  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi'
  ];
  


  

  /* @member "abt_code":  De string welke de abt_code voorstelt, te tonen in de popup modal
   */
  // abt_code : string;

  constructor(private modalService: NgbModal, private httpClient: HttpClient) { }

  /* @function:     Laadt interface in
   * @author:       bors
   */
  ngOnInit() {
    this.requestFragments(this.startupBook);
    // this.requestAuthors();
    // this.requestBibliography();
    // this.requestSecondaryCommentary(this.startupBook);
  }

  // public requestItem(requestedItem: Array<string>){
  //   var requestedJSON : JSON;

  //   this.api = new APIComponent(this.httpClient);
  //   this.api
  //         .getItem(requestedItem)
  //         .then(result => {
  //           requestedJSON = result as JSON;
  //           // this.getString(this.commentaar);
  //           this.ready = true;
  //         })
  //         .catch(error => console.log(error));
  //   return requestedJSON;
  // }  
  
  public requestFragments(currentBook: Array<string>){
    this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getFragments(currentBook)
          .then(result => {
            this.root = result as JSON;
            this.getString(this.commentaar);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public putInArray(){
    for(let arrayElement in this.root){
        // console.log("found it", this.root[arrayElement][0], this.root[arrayElement][1] );
        this.list1.push(this.root[arrayElement][1]);
      }
    console.log(this.list1);
  }

  public fixContext2(requestedAuthor: string){
    console.log("fixContext author: ", requestedAuthor);
    // requestedAuthor = String(requestedAuthor)


    for(let arrayElement in this.F_Context){
      // console.log("aanwezig: ", gegevenRegel, this.root[arrayElement][1] );
      if(String(this.F_Context[arrayElement][0]) == requestedAuthor){
        // if(Number(this.commentaar2[arrayElement][1]) >= gegevenRegel){
          console.log("found it", requestedAuthor, this.F_Context[arrayElement][0], arrayElement );
          // var tempie = Number(arrayElement) // = arrayElement + 1; // Dit kan echt niet.
          // tempie = tempie + 1;
          var temp = Array<string>(arrayElement);
          console.log(this.F_Context[arrayElement][1]);
          // this.F_ContextTemp = this.F_Context[arrayElement][1]
          this.F_ContextTemp = [];
          this.F_ContextTemp.push(this.F_Context[arrayElement][1]);

      }
    }
  }
  

  public requestF_Commentaar(requestedLine: Array<string>){
    console.log("F_Commentaar requested!");
    this.selectedLine = +requestedLine;
    console.log(this.selectedLine);
    this.api = new APIComponent(this.httpClient);
    this.api
          .getF_Commentaar(requestedLine, this.currentBook)
          .then(result => {
            this.F_Commentaar = result as JSON;
            this.getString(this.F_Commentaar);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestF_Context(currentBook: Array<string>){
    this.currentBook = currentBook;
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

  public requestF_AppCrit(currentBook: Array<string>){
    this.currentBook = currentBook;
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

  public requestBooks(authorEntry : Array<string>){
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

  public ophalenCommentaren(gegevenFragment){
    gegevenFragment = String(gegevenFragment)

    for(let arrayElement in this.root){
      // console.log("aanwezig: ", gegevenRegel, this.root[arrayElement][1] );
      if(String(this.root[arrayElement][1]) == gegevenFragment){
        // if(Number(this.commentaar2[arrayElement][1]) >= gegevenRegel){
          console.log("found it", gegevenFragment, this.root[arrayElement][1], arrayElement );
          // var tempie = Number(arrayElement) // = arrayElement + 1; // Dit kan echt niet.
          // tempie = tempie + 1;
          var temp = Array<string>(arrayElement);

          // this.requestCommentaar(temp);
          // this.commentaar2_deels = this.commentaar2[arrayElement][2]
        // }
      }
    }

    // ophalen Commentaar
    this.requestF_Commentaar(temp);

    // ophalen AppCrit
    this.requestF_AppCrit(temp);

    // ophalen Context
    this.requestF_Context(temp);

    // console.log("root: ", gegevenRegel, this.root[1]);



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

  // public drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  // }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

  drop1(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.list1, event.previousIndex, event.currentIndex);
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
    this.modalService.open(bib1, { size: 'lg' });
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
  public getFragments(currentBook : Array<string>) : Promise<any> {
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
  public getF_Commentaar(requestedLine : Array<string>, currentBook : Array<string>) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getF_Commentary', {
              params: {
                requestedLine: requestedLine.toString(),
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getF_AppCrit(currentBook : Array<string>) : Promise<any> {
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

  public getF_Context(currentBook : Array<string>) : Promise<any> {
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

  public getAuthors() : Promise<any> {
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getAuthors')
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getBooks(authorEntry : Array<string>) : Promise<any> {
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

  public getBibliography(currentText : Array<string>) : Promise<any> {
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
