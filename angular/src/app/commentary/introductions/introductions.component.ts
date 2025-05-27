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
import { ApiService } from '@oscc/api.service';

// Model imports
import { Introduction } from '@oscc/models/Introduction';

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
    @Inject(MAT_DIALOG_DATA) public filter: any,
    public dialogRef: MatDialogRef<IntroductionsComponent>,
    protected api: ApiService
  ) {}

  ngOnInit(): void {
    const filter = this.filter;
    filter['document_type'] = 'introduction';

    // Set 'Introduction on' text.
    if (filter.editor) {
      this.introduction_on = filter.editor;
    } else if (filter.title) {
      this.introduction_on = filter.title;
    } else {
      this.introduction_on = filter.author;
    }

    this.api.request_documents(this.filter).subscribe((introductions: any) => {
      if (introductions.length == 0) {
        this.content = 'No introduction found.';
      } else if (filter.editor == null && filter.title == null) {
        // Assume author introduction
        const author_introductions = introductions.filter((introduction: Introduction) => introduction.title === ''); // Filter out any matches of a title by said author
        if (author_introductions.length > 0) {
          this.content = author_introductions[0].text;
        } else {
          this.content = 'No introduction found.';
        }
      } else if (filter.author == null && filter.title == null) {
        // Assume editor introduction
        this.content = introductions[0].text;
      } else {
        // Assume title introduction
        this.content = introductions[0].text;
      }
    });
  }
}
