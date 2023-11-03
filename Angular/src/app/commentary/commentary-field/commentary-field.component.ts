import { Component, Input } from '@angular/core';
import { Commentary_field } from '@oscc/models/commentary/Commentary';

@Component({
  selector: 'app-commentary-field',
  templateUrl: './commentary-field.component.html',
  styleUrls: ['./commentary-field.component.scss'],
})
export class CommentaryFieldComponent {
  @Input() commentary: Commentary_field;
}
