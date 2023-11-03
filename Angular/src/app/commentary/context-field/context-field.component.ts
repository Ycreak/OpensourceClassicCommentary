import { Component, Input } from '@angular/core';
import { Context_field } from '@oscc/models/commentary/Context';

@Component({
  selector: 'app-context-field',
  templateUrl: './context-field.component.html',
  styleUrls: ['./context-field.component.scss'],
})
export class ContextFieldComponent {
  @Input() context: Context_field;
}
