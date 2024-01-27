import { Component, Input, Output, EventEmitter } from '@angular/core';

// Service imports
import { ApiService } from '@oscc/api.service';

@Component({
  selector: 'app-latin-tragic-fragment-filter',
  templateUrl: './latin-tragic-fragment-filter.component.html',
  styleUrl: './latin-tragic-fragment-filter.component.scss',
})
export class LatinTragicFragmentFilterComponent {
  @Input() button_title: string;
  @Input() button_type: string;
  @Input() endpoint: string;
  @Output() new_filter = new EventEmitter<object>();

  protected selected_author: string;
  protected selected_title: string;
  protected selected_editor: string;
  protected selected_name: string;

  protected titles: string[];
  protected editors: string[];
  protected names: string[];

  constructor(protected api: ApiService) {}

  protected filter() {
    const filter = {
      author: this.selected_author,
      title: this.selected_title,
      editor: this.selected_editor,
      name: this.selected_name,
    };
    this.new_filter.emit(filter);
  }
}
