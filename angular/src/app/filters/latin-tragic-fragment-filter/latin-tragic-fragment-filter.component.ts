import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatMenu } from '@angular/material/menu';

// Service imports
import { FragmentsApiService } from '@oscc/services/api/fragments.service';

@Component({
  selector: 'app-latin-tragic-fragment-filter',
  templateUrl: './latin-tragic-fragment-filter.component.html',
  styleUrl: './latin-tragic-fragment-filter.component.scss',
})
export class LatinTragicFragmentFilterComponent {
  @Input() matMenu: MatMenu;
  @Input() button_title: string;
  @Input() button_type: string;
  @Input() endpoint: string;
  @Output() new_filter = new EventEmitter<object>();

  protected _author: string;
  protected _title: string;
  protected _editor: string;
  protected _name: string;

  constructor(protected api: FragmentsApiService) {}

  protected filter() {
    const filter = {
      author: this._author,
      title: this._title,
      editor: this._editor,
      name: this._name,
    };
    this.new_filter.emit(filter);
  }
}
