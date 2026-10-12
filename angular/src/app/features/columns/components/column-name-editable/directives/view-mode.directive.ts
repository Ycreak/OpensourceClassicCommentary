import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[appViewMode]',
  standalone: true,
})
export class ViewModeDirective {
  tpl = inject<TemplateRef<any>>(TemplateRef);
}
