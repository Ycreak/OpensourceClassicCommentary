import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appViewMode]',
  standalone: true,
})
export class ViewModeDirective {
  constructor(public tpl: TemplateRef<any>) {}
}
