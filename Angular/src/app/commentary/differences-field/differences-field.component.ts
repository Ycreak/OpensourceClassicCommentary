import { Component, Input } from '@angular/core';
import { Differences_field } from '@oscc/models/commentary/Differences';

@Component({
  selector: 'app-differences-field',
  templateUrl: './differences-field.component.html',
  styleUrls: ['./differences-field.component.scss'],
})
export class DifferencesFieldComponent {
  @Input() differences: Differences_field;
}
