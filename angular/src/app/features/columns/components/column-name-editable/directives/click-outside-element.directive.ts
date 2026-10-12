import { Directive, EventEmitter, HostListener, Output, ElementRef, inject } from '@angular/core';
import { EditableColumnNameComponent } from '@oscc/features/columns/components/column-name-editable/column-name-editable.component';

@Directive({
  selector: '[appOutsideClick]',
  standalone: true,
})
export class OutsideClickDirective {
  private elementRef = inject(ElementRef);
  private editable = inject(EditableColumnNameComponent);

  @Output()
  outsideClick: EventEmitter<MouseEvent> = new EventEmitter();
  @HostListener('document:mousedown', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.editable.toViewMode(false);
    }
  }
}
