import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  // Components that hold the text and commentary
  T_Text;
  T_TextCommentary

  // Currently selected book and line
  currentBook : number = 1;
  selectedLine : number;

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    ) { }

  ngOnInit(): void {
    this.RequestText(1)
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




