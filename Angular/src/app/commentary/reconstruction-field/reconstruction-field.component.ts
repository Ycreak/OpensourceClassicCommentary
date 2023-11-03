import { Component, Input } from '@angular/core';
import { Reconstruction_field } from '@oscc/models/commentary/Reconstruction';

@Component({
  selector: 'app-reconstruction-field',
  templateUrl: './reconstruction-field.component.html',
  styleUrls: ['./reconstruction-field.component.scss'],
})
export class ReconstructionFieldComponent {
  @Input() reconstruction: Reconstruction_field;
}
