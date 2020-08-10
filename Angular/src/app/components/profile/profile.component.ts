import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})



export class ProfileComponent implements OnInit {

  serverURL = 'http://katwijk.nolden.biz:5002/';  


  constructor(
    private httpClient: HttpClient, 
    private modalService: NgbModal, 
  ) { }

  ngOnInit() {
  }

  public test(){
    console.log('hello there!')
    let my = 6;
    return my;
  }

  /**
  * Fetches referencerID from the server. Returns this data in a JSON Array. Needs to be
  * combined with the fetchData function (but has different parameters xD)
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
 public async fetchReferencerID(fragmentID: Number, editorID: string, currentBook : Number, url : string){
  const data = await this.httpClient.get(
    this.serverURL + url,{
      params: {
        fragment: fragmentID.toString(),
        editorID: editorID.toString(),
        currentBook: currentBook.toString(),
      }
    })
    .toPromise();
  return data;  
}

  /**
  * Fetches data from the server. Returns this data in a JSON Array.
  * @param currentBook
  * @param url 
  * @returns data JSON object
  * @author Ycreak
  */
 public async fetchData(currentBook : string, url : String){
  const data = await this.httpClient.get(
    this.serverURL + url,{
      params: {
        currentBook: currentBook.toString(),
      }
    })
    .toPromise();
  return data;  
}



  // Checks if an object is empty. Returns a boolean.
  public isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
  }

  /**
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */ // TODO: Should put Adesp and Incert. on the bottom. 
  public sortArrayNumerically(a, b) {
    // Sort array via the number element given.
  
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.fragNumber.split("-", 1));
    const B = Number(b.fragNumber.split("-", 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

    /** A PARAMETER SHOULD BE GIVEN BUT I AM A WORTHLESS PROGRAMMER xD lineNumber vs fragNumber
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */ // TODO: Should put Adesp and Incert. on the bottom. 
  public sortArrayNumerically2(a, b) {
    // Sort array via the number element given.
  
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.lineNumber.split("-", 1));
    const B = Number(b.lineNumber.split("-", 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

  /**
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */ // TODO: Should put Adesp and Incert. on the bottom. 
  public sortArrayNumerically3(a, b) {
    // Sort array via the number element given.
  
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a);
    const B = Number(b);

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }



  // // Request Books by given Author (in the modal)
  // public async requestBooks(selectedAuthor: Array<string>){
  //   let temp;
  //   temp = await this.fetchData(Number(selectedAuthor[0]), 'getBooks') as JSON;
  //   console.log('result', temp);
  //   return temp;
  // }
  
}

