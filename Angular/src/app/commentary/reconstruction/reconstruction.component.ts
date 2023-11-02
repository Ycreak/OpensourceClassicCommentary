import { Component, Input } from '@angular/core';
import { Reconstruction_field } from '@oscc/models/commentary/Reconstruction';

@Component({
  selector: 'app-reconstruction',
  templateUrl: './reconstruction.component.html',
  styleUrls: ['./reconstruction.component.scss'],
})
export class ReconstructionComponent {
  @Input() reconstruction: Reconstruction_field;
}
