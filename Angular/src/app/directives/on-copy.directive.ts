import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnCopy]'
})
export class OnCopyDirective {
  @Output() copyFragment = new EventEmitter();

  @HostListener('window:keydown.control.c') onCtrlC() {
  this.copyFragment.emit();
  }
}
