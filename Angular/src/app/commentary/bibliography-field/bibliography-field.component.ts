import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bibliography-field',
  templateUrl: './bibliography-field.component.html',
  styleUrls: ['./bibliography-field.component.scss'],
})
export class BibliographyFieldComponent {
  @Input() bibliography: string;
}
