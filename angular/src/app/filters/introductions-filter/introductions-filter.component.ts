import { Component, Input, Output, EventEmitter } from '@angular/core';

// Service imports
import { ApiService } from '@oscc/api.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-introductions-filter',
  templateUrl: './introductions-filter.component.html',
  styleUrl: './introductions-filter.component.scss',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatMenuModule, NgFor],
})
export class IntroductionsFilterComponent {
  @Input() button_title: string;
  @Input() button_type: string;
  @Input() endpoint: string;
  @Output() new_filter = new EventEmitter<object>();
  @Output() set_introduction_tab = new EventEmitter<string>();

  protected selected_author = '';
  protected selected_title = '';
  protected selected_editor = '';

  protected titles: string[]; //TODO rename this

  protected introduction_type: string;

  constructor(protected api: ApiService) {}

  /** Emits a filter whenever one is selected */
  protected filter(introduction_type: string) {
    // Switch to correct tab
    console.log('emit: ' + introduction_type);
    this.set_introduction_tab.emit(introduction_type);

    // Load the selected introduction
    const filter = {
      document_type: 'introduction',
      author: this.selected_author,
      title: this.selected_title,
      editor: this.selected_editor,
    };
    this.new_filter.emit(filter);
    this.selected_author = '';
    this.selected_title = '';
    this.selected_editor = '';
  }

  /**  */
  protected get_introductions_based_on_type(introduction_type: string): string[] {
    const retrieved_introductions: Array<string> = [];
    let retrieved_introductions_titles: Array<string> = [];
    const retrieved_introductions_authors: Array<string> = [];
    switch (introduction_type) {
      case 'Author introductions':
        return this.api.get_from_index('author', { document_type: 'introduction', title: '', editor: '' });

      case 'Title introductions':
        retrieved_introductions_titles = this.api.get_from_index('title', {
          document_type: 'introduction',
          editor: '',
        });
        // Filter out any author introductions (these will have title="")
        retrieved_introductions_titles = retrieved_introductions_titles.filter((intro) => intro != '');

        // Look up the corresponding author for each title
        for (let i = 0; i < retrieved_introductions_titles.length; ) {
          const authors: Array<string> = this.api.get_from_index('author', {
            document_type: 'introduction',
            title: retrieved_introductions_titles[i],
            editor: '',
          });
          // Multiple authors might be found for a single title. Push all these to the list of retrieved authors.
          for (const author of authors) {
            retrieved_introductions_authors.push(author);
            i++;
          }
        }
        // Put the authors in brackets behind the title name
        for (let i = 0; i < retrieved_introductions_titles.length; i++) {
          retrieved_introductions.push(
            retrieved_introductions_titles[i] + ' (' + retrieved_introductions_authors[i] + ')'
          );
        }
        return retrieved_introductions;

      case 'Editor introductions':
        return this.api.get_from_index('editor', { document_type: 'introduction', author: '', title: '' });
    }
  }

  protected set_introduction_type(introduction_type: string): void {
    this.introduction_type = introduction_type;
  }
}
