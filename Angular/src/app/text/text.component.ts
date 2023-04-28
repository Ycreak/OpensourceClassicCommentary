import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent implements OnInit {
  @ViewChild('CallBookSelect') CallBookSelect: TemplateRef<any>;
  authorsJSON: any;
  booksJSON: any;
  // Components that hold the text and commentary
  T_Text: any;
  T_TextCommentary: any;
  // Currently selected book and line
  currentBook: number = 1;
  currentBookTitle: string;
  selectedLine: number;
  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // this.api.get_authors().subscribe(data => this.authorsJSON = data);
    this.RequestText(1); // Retrieve Seneca's Thyestes by default
  }

  /**
   * Requests a list of titles using a given author
   * @param author whose titles are to be returned
   */
  public RequestBooks(author: string) {
    // this.api.get_titles(author).subscribe(
    //   data => {
    //     this.booksJSON = data;
    //     // this.currentBook = data[0].id; //FIXME: broken
    //     this.currentBookTitle = data[0].title
    //   }
    // );
  }

  /**
   * Opens the dialog to select a text
   */
  public OpenBookSelect() {
    let dialogRef = this.dialog.open(this.CallBookSelect);
  }

  /**
   * Request the text from the given title
   * @param title whose text is to be retrieved
   */
  public RequestText(title: number) {
    //this.api.get_text(title).subscribe((data) => {
    //this.T_Text = data;
    //});
  }

  /**
   * Returns the commentary belonging to the given linenumber
   * @param lineNumber whose commentary is to be retrieved
   */
  public RequestCommentary(lineNumber: number) {
    this.selectedLine = lineNumber;

    //this.api.get_text_commentary(this.currentBook, lineNumber).subscribe((data) => {
    //this.T_TextCommentary = data;
    //});
  }

  /**
   * Checks whether the commentaar is within the scope.
   * If not, the modal will be collapsed as not relevant
   * FIXME: can be done much more elegant
   * @param commentaarScope // FIXME: what is this?
   */
  public IsWithinScope(commentaarScope: number) {
    return commentaarScope + 6 > this.selectedLine;
  }
}
