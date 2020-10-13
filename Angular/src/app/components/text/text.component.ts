import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms'
import { getRandomString } from 'selenium-webdriver/safari';
// import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
// import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';

// import 'hammerjs';

// import '@angular/material/prebuilt-themes/deeppurple-amber.css';
// import "../node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css";

// Imports navbar from file Navbar
// @Component({
//   selector: 'app-navbar',
//   // templateUrl: './header.html',
//   // styleUrls: ['../fragments/fragments.component.css'],
// })
// export class DeviceComponent {}

@Component({
  selector: 'app-interface',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css'],
})

export class TextComponent implements OnInit {

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

  requestedItem : Array<String>;
  // requestedJSON : JSON;

  ready : boolean = false;
  results : string[] = [];
  closeResult: string;

  stringArray : Array<string> = [];

  givenText : Array<string> = [];

  currentAuthor : Array<string> = ['1'];
  currentBook : Array<string> = ['1'];
  startupBook : Array<string> = ['1'];

  selectedLine : number = 0;
  gegevenRegel : number = 0;

  panelOpenState: boolean = false;
  allExpandState = true;

  fragments : boolean = false;

  /* @member "abt_code":  De string welke de abt_code voorstelt, te tonen in de popup modal
   */
  // abt_code : string;

  constructor(private httpClient: HttpClient) { }

  /* @function:     Laadt interface in
   * @author:       bors
   */
  ngOnInit() {
    this.requestPrimaryText(this.startupBook);
    this.requestAuthors();
    this.requestBibliography();
    this.requestSecondaryCommentary(this.startupBook);
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
  
  public requestPrimaryText(currentBook: Array<string>){
    this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getPrimaryText(currentBook)
          .then(result => {
            this.root = result as JSON;
            this.getString(this.commentaar);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestCommentaar(requestedLine: Array<string>){
    console.log("Commentaar requested!");
    this.selectedLine = +requestedLine;
    console.log(this.selectedLine);
    this.api = new APIComponent(this.httpClient);
    this.api
          .getCommentaar(requestedLine, this.currentBook)
          .then(result => {
            this.commentaar = result as JSON;
            this.getString(this.commentaar);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestSecondaryCommentary(currentBook: Array<string>){
    this.currentBook = currentBook;
    this.api = new APIComponent(this.httpClient);
    this.api
          .getSecondaryCommentary(currentBook)
          .then(result => {
            this.commentaar2 = result as JSON;
            this.getString(this.commentaar);
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

  public ophalenCommentaren(gegevenRegel){
    this.requestCommentaar(gegevenRegel);
    gegevenRegel = Number(gegevenRegel)

    for(let arrayElement in this.commentaar2){
      if(Number(this.commentaar2[arrayElement][0]) <= gegevenRegel){
        if(Number(this.commentaar2[arrayElement][1]) >= gegevenRegel){
          // console.log("found it", gegevenRegel, this.commentaar2[arrayElement][0], this.commentaar2[arrayElement][1] );
          this.commentaar2_deels = this.commentaar2[arrayElement][2]
        }
      }
    }
  }
  
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


  // openSm(content) {
  //   this.modalService.open(content, { size: 'sm' });
  // }

  // openLg(bib1) {
  //   this.modalService.open(bib1, { size: 'lg' });
  // }

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

  // open(content) {
  //   this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }

  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return  `with: ${reason}`;
  //   }
  // }
}



  /* @class:    Deze component neemt alle requests (API) voor zijn rekening
   */
class APIComponent {

  constructor(private httpClient: HttpClient) { /* empty */ }

  /* @function:     Haalt de primaire text op.
   * @return:       De promise van de get request.
   * @author:       Bors & Nolden.
   */
  public getPrimaryText(currentBook : Array<string>) : Promise<any> {
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getPrimaryText',{
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
  public getCommentaar(requestedLine : Array<string>, currentBook : Array<string>) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getCommentary', {
              params: {
                requestedLine: requestedLine.toString(),
                currentBook: currentBook.toString(),
              },
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  public getSecondaryCommentary(currentBook : Array<string>) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://katwijk.nolden.biz:5002/getSecondaryCommentary', {
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

