import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[appOnCopy]',
})
export class OnCopyDirective {
  @Output() copyFragment = new EventEmitter();

  @HostListener('window:keydown.control.c') onCtrlC() {
    this.copyFragment.emit();
  }
}
