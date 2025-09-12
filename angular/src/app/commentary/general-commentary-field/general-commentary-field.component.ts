import { Component, Input } from '@angular/core';
import { ExpandableTextComponent } from '../../other_components/expandable-text/expandable-text.component';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-general-commentary-field',
  templateUrl: './general-commentary-field.component.html',
  styleUrls: ['./general-commentary-field.component.scss'],
  standalone: true,
  imports: [MatExpansionModule, ExpandableTextComponent],
})
export class GeneralCommentaryFieldComponent {
  @Input() content: string;
  @Input() title: string;
}
