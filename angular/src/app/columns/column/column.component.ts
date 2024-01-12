import { Component, Input } from '@angular/core';
import {ColumnsService} from '@oscc/columns/columns.service';
import {UtilityService} from '@oscc/utility.service';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrl: './column.component.scss'
})
export class ColumnComponent {
  @Input() given_column: any;

  constructor(
    protected columns: ColumnsService,
    protected utility: UtilityService
  ) {}
  
  /**
   * Helper function to find and return the textual content of a given document object
   * @author CptVickers
   */
  protected copy_document_content(given_document: any): void {
    if (!window.getSelection().toString()) {
      // Check if the user isn't trying to copy some other text.

      let content = '';

      if (!given_document.fragments_translated) {
        // Parse the fragment lines into a single string
        const fragment_lines = given_document.lines;
        for (const line of fragment_lines) {
          content += line.line_number + ': ' + line.text + '\n';
        }
      } else {
        content = given_document.translation;
      }
      // Move the result to the user's clipboard
      navigator.clipboard.writeText(content);
      // Notify the user that the text has been copied
      this.utility.open_snackbar('Document copied!');
    }
  }

}
