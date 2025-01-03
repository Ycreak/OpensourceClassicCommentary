import { Component, Input, Output, EventEmitter } from '@angular/core';

// Service imports
import { ApiService } from '@oscc/api.service';

@Component({
  selector: 'app-introductions-filter',
  templateUrl: './introductions-filter.component.html',
  styleUrl: './introductions-filter.component.scss',
})
export class IntroductionsFilterComponent {
  @Input() button_title: string;
  @Input() button_type: string;
  @Input() endpoint: string;
  @Output() new_filter = new EventEmitter<object>();

  protected selected_author = '';
  protected selected_title = '';

  protected titles: string[];

  constructor(
    protected api: ApiService
  ) {}

  /** Emits a filter whenever one is selected */
  protected filter() {
    const filter = {
      document_type: 'introduction',
      author: this.selected_author,
      title: this.selected_title,
    };
    this.new_filter.emit(filter);
    this.selected_author = "";
    this.selected_title = "";
  }
}
