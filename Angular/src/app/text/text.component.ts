import { Component, OnInit } from '@angular/core';

import {LoginComponent} from '../login/login.component'

import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';

// Library used for interacting with the page
// import {MatDialog} from '@angular/material/dialog';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Inject} from '@angular/core';

// To allow dialog windows within the current window
import { TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  T_Text;
  T_TextCommentary

  currentBook : number = 1;


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
  startupBook : Array<string> = ['1'];

  selectedLine : number = 0;
  gegevenRegel : number = 0;

  panelOpenState: boolean = false;
  allExpandState = true;

  fragments : boolean = false;

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    // private router: Router,
    private dialog: MatDialog, 
    ) { }

  ngOnInit(): void {
    // Request the Thyestes Text
    this.RequestText(1)


  }

  public RequestText(book: number){
    this.api.GetText(book).subscribe(
      data => {
        this.T_Text = data;
        console.log('return', data)
      }
    );  
  }

  public RequestCommentary(lineNumber: number){
    this.api.GetTextCommentary(this.currentBook, lineNumber).subscribe(
      data => {
        this.T_TextCommentary = data;
        console.log('comments', data)
      }
    );  
  }

  
  public getString(insertedJSON: JSON){
    return JSON.stringify(insertedJSON);
  }

  public showInfo(temp1: Array<string>){
    console.log(temp1);
  }

  public isValidFoo(commentaarScope : number){
    console.log("scope", commentaarScope)
    if (commentaarScope + 6 > this.selectedLine){
      return true;
    } else {
      return false;
    }
  }

  public checkEmptyBlock(temp : JSON){
    // console.log("hi", temp)
    if(this.utility.IsEmpty(temp)) {
      // console.log("empty");// Object is empty (Would return true in this example)
      return true;
    } else {
      // console.log("not empty");
      return false;
    }
  
  }
}




