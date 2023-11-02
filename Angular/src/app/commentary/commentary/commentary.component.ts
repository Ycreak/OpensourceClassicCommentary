import { Component, Input } from '@angular/core';
import { Commentary_field } from '@oscc/models/commentary/Commentary';

@Component({
  selector: 'app-commentary',
  templateUrl: './commentary.component.html',
  styleUrls: ['./commentary.component.scss'],
})
export class CommentaryComponent {
  @Input() commentary: Commentary_field;
}
