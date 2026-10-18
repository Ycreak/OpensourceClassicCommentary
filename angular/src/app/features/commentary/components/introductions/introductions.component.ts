/**
 * This component visualises an introduction. An introduction can either be about an author or a title.
 * If an author is given, we will retrieve an introduction for the author from the server and show it on screen.
 * If both author and title are provided, we will fetch the introduction from the title given the author, as titles
 * are not unique.
 * @author Ycreak
 */

// Library imports
import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogClose, MatDialogContent } from '@angular/material/dialog';

// Service imports
import { ApiService } from '@oscc/services/api.service';

// Model imports
import { Introduction } from '@oscc/types/Introduction';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-introductions',
  templateUrl: './introductions.component.html',
  styleUrls: ['./introductions.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatDialogClose, MatIconModule, MatDialogContent],
})
export class IntroductionsComponent implements OnInit {
  filter = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<IntroductionsComponent>>(MatDialogRef);
  protected api = inject(ApiService);

  // Signals: the app runs without zone.js, so state set from an api response
  // only repaints the dialog when it is signalled.
  protected content = signal('');
  // Keep track of whether the introduction is about the author or the title
  protected introduction_on = signal('');

  ngOnInit(): void {
    const filter = this.filter;
    filter['document_type'] = 'introduction';

    // Set 'Introduction on' text.
    if (filter.editor) {
      this.introduction_on.set(filter.editor);
    } else if (filter.title) {
      this.introduction_on.set(filter.title);
    } else {
      this.introduction_on.set(filter.author);
    }

    this.api.request_documents(this.filter).subscribe((introductions: any) => {
      if (introductions.length == 0) {
        this.content.set('No introduction found.');
      } else if (filter.editor == null && filter.title == null) {
        // Assume author introduction
        const author_introductions = introductions.filter((introduction: Introduction) => introduction.title === ''); // Filter out any matches of a title by said author
        if (author_introductions.length > 0) {
          this.content.set(author_introductions[0].text);
        } else {
          this.content.set('No introduction found.');
        }
      } else if (filter.author == null && filter.title == null) {
        // Assume editor introduction
        this.content.set(introductions[0].text);
      } else {
        // Assume title introduction
        this.content.set(introductions[0].text);
      }
    });
  }
}
