import { Directive, HostListener } from '@angular/core';
import { EditableColumnNameComponent } from './column-name-editable.component';

@Directive({
  selector: '[appEditableKeypressHandler]',
})
export class EditableOnKeypressDirective {
  constructor(private editable: EditableColumnNameComponent) {}

  @HostListener('keyup.enter')
  onEnter() {
    this.editable.toViewMode(true);
  }
  @HostListener('keyup.escape')
  onEsc() {
    this.editable.toViewMode(false);
  }
}
