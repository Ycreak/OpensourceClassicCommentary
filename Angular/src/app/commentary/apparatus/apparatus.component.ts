/**
 * Component to visualise the apparatus criticus
 */

import { Component, Input } from '@angular/core';
import { Apparatus_field } from '@oscc/models/commentary/Apparatus';

@Component({
  selector: 'app-apparatus',
  templateUrl: './apparatus.component.html',
  styleUrls: ['./apparatus.component.scss'],
})
export class ApparatusComponent {
  @Input() apparatus: Apparatus_field;
}
