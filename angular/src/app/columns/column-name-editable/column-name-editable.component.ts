import { Component, ContentChild, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { ViewModeDirective } from './view-mode.directive';
import { EditModeDirective } from './edit-mode.directive';
import { Subject } from 'rxjs';
import { Column } from '@oscc/models/Column';

@Component({
  selector: 'app-editable-column-name',
  template: ` <ng-container [column]="column" *ngTemplateOutlet="currentView"></ng-container> `,
})
export class EditableColumnNameComponent {
  @ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl: EditModeDirective;
  @Input() column: Column;
  @Output() update = new EventEmitter();

  editMode = new Subject();

  editMode$ = this.editMode.asObservable();

  mode: 'view' | 'edit' = 'view';

  constructor(private el: ElementRef) {}

  public toViewMode(confirmEdit: boolean) {
    if (confirmEdit) {
      this.update.emit(this.column);
    }
    this.mode = 'view';
  }

  public toEditMode(): void {
    this.mode = 'edit';
  }

  private get element() {
    return this.el.nativeElement;
  }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }
}
