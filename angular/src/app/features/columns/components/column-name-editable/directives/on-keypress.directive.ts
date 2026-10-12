import { Directive, HostListener, inject } from '@angular/core';
import { EditableColumnNameComponent } from '@oscc/features/columns/components/column-name-editable/column-name-editable.component';

@Directive({
  selector: '[appEditableKeypressHandler]',
  standalone: true,
})
export class EditableOnKeypressDirective {
  private editable = inject(EditableColumnNameComponent);

  @HostListener('keyup.enter')
  onEnter() {
    this.editable.toViewMode(true);
  }
  @HostListener('keyup.escape')
  onEsc() {
    this.editable.toViewMode(false);
  }
}
