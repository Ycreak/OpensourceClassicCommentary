/**
 * The translation component of the commentary differs because it can accept translations and original text. The problem is that
 * the original text might be represented by lines instead of by a simple string. This component handles this possibility.
 */

import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Commentary } from '@oscc/models/Commentary';
import { Line } from '@oscc/models/Line';

@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss'],
})
export class TranslationComponent implements OnChanges {
  @Input() commentary: Commentary;
  @Input() translated: boolean;

  protected translation: string;
  protected expansion_panel_title: string;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.translated) {
      this.process_translation();
    }
  }

  /**
   * Sets the correct title and translation given the translated flag.
   * @author Ycreak
   */
  private process_translation(): void {
    if (this.translated) {
      this.expansion_panel_title = 'Original text';
      this.translation = '';
      //TODO: this does not add HTML like the <10> flag. This function is part of the Fragment model,
      // not the commentary model. We will probably need to put these functions in a helper service.
      this.commentary.lines.forEach((line: Line) => {
        this.translation += `<p>${line.line_number}: ${line.text}</p>`;
      });
    } else {
      this.expansion_panel_title = 'Fragment translation';
      this.translation = this.commentary.translation;
    }
  }
}
