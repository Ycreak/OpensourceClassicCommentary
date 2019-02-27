import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms'

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
  ready : boolean = false;
  selected_features : { [id: string] : boolean; } = {};
  all_features : Array<string> = [];
  results : string[] = [];
  selected_customs: { [id:string] : { [id:string] : string } } = {};

  stringArray : Array<string> = [];

  /* @member "abt_code":  De string welke de abt_code voorstelt, te tonen in de popup modal
   */
  abt_code : string;


  constructor(  private httpClient: HttpClient) { }

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

  public onSubmit(f: NgForm) {
    console.log(f.value);  // { first: '', last: '' }
    const temp = f.value;

    // console.log('hello' + f.value[0]);  // false
    var o = { "key1": "value1", "key2": "value2"};
    var val = o["key2"];   // value2
    console.log(val);

    var temp1 = f.value;
    console.log(temp1);
    var o1 = f.value;
    var val1 = o1["key2"];   // value2
    console.log('hiero' + val1);

    this.requestCommentaar(f.value);
  }


  // public requestCommentaar(){
  //   console.log("commentaar requested!");
  //   this.api = new APIComponent(this.httpClient);
  //   this.api
  //         .getCommentaar()
  //         .then(result => {
  //           this.root2 = result as JSON;
  //           //this.stringArray = result as JSON;
  //           this.getString(this.root2);
  //           this.ready = true;
  //         })
  //         .catch(error => console.log(error));
  // }

  public requestCommentaar(test1: Array<string>){
    console.log("Commentaar requested!");
    // console.log(test1);
    this.api = new APIComponent(this.httpClient);
    this.api
          .getTest(test1)
          .then(result => {
            this.root3 = result as JSON;
            console.log('before: ' + this.root);
            this.getString(this.root3);
            console.log('after: ' + this.root3);
            this.ready = true;

            // this.openLg(this.generated);
          })
          .catch(error => console.log(error));
          // console.log(this.abt_code);
  }

  public getString(temp1: JSON){
  //  console.log(temp1);
    return JSON.stringify(temp1);
    //const a = JSON.parse(temp1);
    //return a;
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

  public getCommentaar() : Promise<any> {
    return this.httpClient
            .get('http://localhost:5002/2')
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

  /* @function:     Een get request naar de abt code
   * @param "list": Een lijst met namen van features
   * @return:       De promise van de get request
   * @author:       bors
   */
  // HIER VERDER, AANROEP GAAT GOED, NU NOG VERWERKEN!!!
  public getTest(list : Array<string>) : Promise<any> {
    console.log(list);
    return  this.httpClient
            .get('http://localhost:5002/4', {
              params: {
                test1: list.toString()
              },
              observe: 'response'
            })
            .toPromise()
            .then(this.extractData)
            .catch(this.handleError);
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

