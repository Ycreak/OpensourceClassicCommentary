import { Directive, HostListener } from '@angular/core';
import { EditableColumnNameComponent } from './column-name-editable.component';

@Directive({
  selector: '[appEditableOnEnter]',
})
export class EditableOnEnterDirective {
  constructor(private editable: EditableColumnNameComponent) {}

  @HostListener('keyup.enter')
  onEnter() {
    this.editable.toViewMode();
  }
}
