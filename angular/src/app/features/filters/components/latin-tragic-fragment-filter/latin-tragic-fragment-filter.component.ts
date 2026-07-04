import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { PLAYGROUND_ICON } from '@src/assets/img/image-constants';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApiService } from '@oscc/services/api.service';
import { UtilityService } from '@oscc/services/utility.service';

@Component({
  selector: 'app-latin-tragic-fragment-filter',
  templateUrl: './latin-tragic-fragment-filter.component.html',
  styleUrl: './latin-tragic-fragment-filter.component.scss',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatTooltipModule],
})
export class LatinTragicFragmentFilterComponent {
  @Input() button_title: string;
  @Input() button_type: string;
  @Input() endpoint: string;
  @Output() new_filter = new EventEmitter<object>();

  // Filter state trackers
  protected _author = signal<string>('');
  protected _title = signal<string>('');
  protected _editor = signal<string>('');
  protected _name = signal<string>('');

  protected playgroundIcon = PLAYGROUND_ICON;

  constructor(
    protected api: ApiService,
    protected utility: UtilityService
  ) {}

  // The computed blocks automatically watch BOTH your local selection signals 
  // AND the ApiService's internal _index signal.
  protected authors = computed(() => {
    return this.api.get_from_index('author', { document_type: 'fragment' });
  });

  protected titles = computed(() => {
    const author = this._author();
    if (!author) return [];
    return this.api.get_from_index('title', { document_type: 'fragment', author });
  });

  protected editors = computed(() => {
    const author = this._author();
    const title = this._title();
    if (!author || !title) return [];
    return this.api.get_from_index('editor', { document_type: 'fragment', author, title });
  });

  protected names = computed(() => {
    const author = this._author();
    const title = this._title();
    const editor = this._editor();
    if (!author || !title || !editor) return [];
    
    const rawNames = this.api.get_from_index('name', {
      document_type: 'fragment',
      author,
      title,
      editor,
    });
    return [...rawNames].sort(this.utility.sort_array_numerically);
  });

  // Action handlers triggered when user interacts with cascading menus
  protected selectAuthor(author: string) {
    this._author.set(author);
    this._title.set(''); 
    this._editor.set('');
    this._name.set('');
  }

  protected selectTitle(title: string) {
    this._title.set(title);
    this._editor.set('');
    this._name.set('');
  }

  protected selectEditor(editor: string) {
    this._editor.set(editor);
    this._name.set('');
  }

  protected filter() {
    const filter = {
      document_type: 'fragment',
      author: this._author(),
      title: this._title(),
      editor: this._editor(),
      name: this._name(),
    };
    this.new_filter.emit(filter);
  }
}
