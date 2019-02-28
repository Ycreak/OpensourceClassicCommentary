import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms'
import { getRandomString } from 'selenium-webdriver/safari';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import 'hammerjs';

// import '@angular/material/prebuilt-themes/deeppurple-amber.css';
// import "../node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css";

@Component({
  selector: 'app-interface',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit {

  /* @member "api":       Het object dat alle requests behandelt
   * @member "root":      JSON object waarin de interface body in is opgeslagen
   * @member "ready":     Houdt bij of de interface is ingeladen
   * @member "selec...":  Houdt de waarden van de checkboxes bij
   * @member "all_f...":  Heeft alle features van alle modules
   * @member "results":   Heeft alle features gevonden door search
   */
  api : APIComponent;
  root : JSON;
  commentaar : JSON;
  temp : Array<string> = [];
  ready : boolean = false;
  // selected_features : { [id: string] : boolean; } = {};
  // all_features : Array<string> = [];
  results : string[] = [];
  // selected_customs: { [id:string] : { [id:string] : string } } = {};
  closeResult: string;

  stringArray : Array<string> = [];
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

  /* @member "abt_code":  De string welke de abt_code voorstelt, te tonen in de popup modal
   */
  // abt_code : string;

  constructor(private modalService: NgbModal, private httpClient: HttpClient) { }

  /* @function:     Laadt interface in
   * @author:       bors
   */
  ngOnInit() {
    this.api = new APIComponent(this.httpClient);
    this.api
          .getPrimaryText()
          .then(result => {
            this.root = result as JSON;
            this.getString(this.root);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public requestCommentaar(requestedLine: Array<string>){
    console.log("Commentaar requested!");
    // console.log(test1);
    this.api = new APIComponent(this.httpClient);
    this.api
          .getCommentaar(requestedLine)
          .then(result => {
            this.commentaar = result as JSON;
            // console.log(this.commentaar[0][0]);
            this.getString(this.commentaar);
            // console.log(this.commentaar);
            this.ready = true;
          })
          .catch(error => console.log(error));
  }

  public getString(insertedJSON: JSON){
  //  console.log(temp1);
    return JSON.stringify(insertedJSON);
  }

  public onSubmit(f: NgForm) {
    // console.log(f.value.input);
    this.requestCommentaar(f.value.input);
  }

  public showInfo(temp1: Array<string>){
    console.log(temp1);
  }

  public testFunction(){
    console.log('de testfunctie is aangeroepen!')
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
  public getPrimaryText() : Promise<any> {
    return this.httpClient
            .get('http://localhost:5002/3')
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
  }

  /* @function:     Een get request naar de abt code
   * @param "list": Een lijst met namen van features
   * @return:       De promise van de get request
   * @author:       bors
   */
  public getCommentaar(requestedLine : Array<string>) : Promise<any> {
    // console.log(list);
    return this.httpClient
            .get('http://localhost:5002/4', {
              params: {
                test1: requestedLine.toString()
              },
              // observe: 'response' DO NOT OBSERVE THIS
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



  public getCommentaarCode(list : Array<string>) : Promise<any> {
    return  this.httpClient
            .get('http://localhost:5002/3', {
              params: {
                interface_selected_features: list.toString()
              },
              observe: 'response'
            })
            .toPromise()
            .catch(this.handleError);
  }

}

