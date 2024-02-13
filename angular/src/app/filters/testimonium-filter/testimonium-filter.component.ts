import { Component, Input, Output, EventEmitter } from '@angular/core';

// Service imports
import { TestimoniaApiService } from '@oscc/services/api/testimonia.service';
import { UtilityService } from '@oscc/utility.service';
@Component({
  selector: 'app-testimonium-filter',
  templateUrl: './testimonium-filter.component.html',
  styleUrl: './testimonium-filter.component.scss',
})
export class TestimoniumFilter {
  @Input() button_title: string;
  @Input() button_type: string;
  @Input() endpoint: string;
  @Output() new_filter = new EventEmitter<object>();

  protected selected_author: string;
  protected selected_name: string;

  protected titles: string[];
  protected editors: string[];
  protected names: string[];

  constructor(
    private utility: UtilityService,
    protected api: TestimoniaApiService
  ) {}

  /** Emits a filter whenever one is selected */
  protected filter() {
    const filter = {
      author: this.selected_author,
      name: this.selected_name,
    };
    this.new_filter.emit(filter);
  }
}
