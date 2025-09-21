import { Directive, EventEmitter, HostListener, Output, ElementRef } from '@angular/core';
import { EditableColumnNameComponent } from '@oscc/columns/column-name-editable/column-name-editable.component';

@Directive({
  selector: '[appOutsideClick]',
})
export class OutsideClickDirective {
  @Output()
  outsideClick: EventEmitter<MouseEvent> = new EventEmitter();

  constructor(
    private elementRef: ElementRef,
    private editable: EditableColumnNameComponent
  ) {}
  @HostListener('document:mousedown', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.editable.toViewMode(false);
    }
  }
}
