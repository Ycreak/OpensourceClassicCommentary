import { Component, Input } from '@angular/core';
import { Differences_field } from '@oscc/models/commentary/Differences';

@Component({
  selector: 'app-differences',
  templateUrl: './differences.component.html',
  styleUrls: ['./differences.component.scss'],
})
export class DifferencesComponent {
  @Input() differences: Differences_field;
}
