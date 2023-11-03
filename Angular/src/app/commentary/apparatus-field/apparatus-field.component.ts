/**
 * Component to visualise the apparatus criticus
 */
import { Component, Input } from '@angular/core';
import { Apparatus_field } from '@oscc/models/commentary/Apparatus';

@Component({
  selector: 'app-apparatus-field',
  templateUrl: './apparatus-field.component.html',
  styleUrls: ['./apparatus-field.component.scss'],
})
export class ApparatusFieldComponent {
  @Input() apparatus: Apparatus_field;
}
