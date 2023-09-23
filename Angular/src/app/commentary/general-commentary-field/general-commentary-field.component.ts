import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-general-commentary-field',
  templateUrl: './general-commentary-field.component.html',
  styleUrls: ['./general-commentary-field.component.scss'],
})
export class GeneralCommentaryFieldComponent {
  @Input() content: string;
  @Input() title: string;
}
