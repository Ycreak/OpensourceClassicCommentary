import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[appEditMode]',
  standalone: true,
})
export class EditModeDirective {
  tpl = inject<TemplateRef<any>>(TemplateRef);
}
