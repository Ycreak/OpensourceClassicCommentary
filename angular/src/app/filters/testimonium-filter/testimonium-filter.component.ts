import { Component, Input, Output, EventEmitter } from '@angular/core';

// Service imports
import { ApiService } from '@oscc/api.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-testimonium-filter',
  templateUrl: './testimonium-filter.component.html',
  styleUrl: './testimonium-filter.component.scss',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatMenuModule, NgFor],
})
export class TestimoniumFilterComponent {
  @Input() button_title: string;
  @Input() button_type: string;
  @Input() endpoint: string;
  @Output() new_filter = new EventEmitter<object>();

  protected selected_author: string;
  protected selected_name: string;

  protected titles: string[];
  protected editors: string[];
  protected names: string[];

  constructor(protected api: ApiService) {}

  /** Emits a filter whenever one is selected */
  protected filter() {
    const filter = {
      document_type: 'testimonium',
      author: this.selected_author,
      name: this.selected_name,
    };
    this.new_filter.emit(filter);
  }
}
