import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import {MatDialog} from '@angular/material/dialog';
import { TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {
  @ViewChild('CallBookSelect') CallBookSelect: TemplateRef<any>;
  authorsJSON;
  booksJSON;
  // Components that hold the text and commentary
  T_Text;
  T_TextCommentary

  // Currently selected book and line
  currentBook : number = 1;
  currentBookTitle : string;
  selectedLine : number;

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    private dialog: MatDialog, 

    ) { }

  ngOnInit(): void {
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
    this.RequestText(1)
  }

  public RequestBooks(author: number){
    this.api.GetBooks(author).subscribe(
      data => {
        this.booksJSON = data;
        console.log(data)
        this.currentBook = data[0].id;
        this.currentBookTitle = data[0].title
      }
    );      
  }

  // Opens dialog to select a new book
  public OpenBookSelect() {
    let dialogRef = this.dialog.open(this.CallBookSelect); 
  }

  public RequestText(book: number){
    this.api.GetText(book).subscribe(
      data => {
        this.T_Text = data;
      }
    );  
  }

  public RequestCommentary(lineNumber: number){
    this.selectedLine = lineNumber;
    
    this.api.GetTextCommentary(this.currentBook, lineNumber).subscribe(
      data => {
        this.T_TextCommentary = data;
      }
    );  
  }

  public IsWithinScope(commentaarScope : number){
    if (commentaarScope + 6 > this.selectedLine){
      return true;
    } else {
      return false;
    }
  }

  public CheckEmptyBlock(block : JSON){
    if(this.utility.IsEmpty(block)) {
      return true;
    } else {
      return false;
    }
  
  }
}




