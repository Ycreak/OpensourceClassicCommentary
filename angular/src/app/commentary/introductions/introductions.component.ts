/**
 * This component visualises an introduction. An introduction can either be about an author or a title.
 * If an author is given, we will retrieve an introduction for the author from the server and show it on screen.
 * If both author and title are provided, we will fetch the introduction from the title given the author, as titles
 * are not unique.
 * @author Ycreak
 */

// Library imports
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Service imports
import { IntroductionsApiService } from '@oscc/services/api/introductions.service';

@Component({
  selector: 'app-introductions',
  templateUrl: './introductions.component.html',
  styleUrls: ['./introductions.component.scss'],
})
export class IntroductionsComponent implements OnInit {
  protected author: string;
  protected title: string;
  protected content: string;
  // Keep track of whether the introduction is about the author or the title
  protected introduction_on: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public introduction: any,
    public dialogRef: MatDialogRef<IntroductionsComponent>,
    protected api: IntroductionsApiService
  ) {
    this.author = introduction.author;
    this.title = introduction.title;
  }

  ngOnInit(): void {
    this.introduction_on = this.title != '' ? this.title : this.author;

    const filter = this.title == '' ? { author: this.author } : { author: this.author, title: this.title };

    this.api.get_introduction(filter).subscribe((introduction: any) => {
      if (introduction.content == '') {
        this.content = 'No introduction found.';
      } else {
        this.content = introduction.content;
      }
    });
  }
}
