/**
 * This component shows the Quill Editor to process the given string. Provides it back immediately
 * the onContentChanged flag.
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BibliographyComponent } from '@oscc/dashboard/bibliography/bibliography.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-quill',
  standalone: true,
  imports: [MatDialogContent, QuillEditorComponent, FormsModule, MatButtonModule, MatDialogClose],
  templateUrl: './quill.component.html',
  styleUrls: ['./quill.component.scss'],
})
export class QuillComponent {
  // We retrieve a value to edit from the parent component
  @Input() value: string = '';
  // Whenever the given value is changed, we immediately communicate the change back
  @Output() valueChange = new EventEmitter<string>();

  constructor(private dialog: MatDialog) {}

  editor_instance: any; // allows communication with the editor

  /**
   * Syncs the content changed in Quill back to the parent component.
   * @param event from which to retrieve the changed string
   */
  protected onContentChanged(event: any) {
    const newValue = event.html || ''; // fallback if html is null
    this.valueChange.emit(newValue);
  }

  /**
   * Function to open the about dialog
   */
  public open_bib_dialog(): Observable<string> {
    const dialogRef = this.dialog.open(BibliographyComponent, {
      autoFocus: false, // To allow scrolling in the dialog
      maxHeight: '90vh', //you can adjust the value as per your view
      minWidth: '500px',
    });
    return dialogRef.afterClosed(); // Returns observable.
  }

  /**
   * Opens the bib selection dialog. On succesful selection, adds the bib entry key after the cursor.
   */
  public add_bib_entry(): void {
    const range = this.editor_instance.getSelection();
    this.open_bib_dialog().subscribe((bib_key) => {
      if (bib_key) {
        if (range) {
          this.editor_instance.insertText(range.index, bib_key, true, 'user');
          //FIXME: the next line makes sure ngModel is updated. This is a bug with the ngx-quill package
          this.editor_instance.insertText(range.index, '', 'user');
        }
      }
    });
  }

  /**
   * This function inserts the given symbol in the desired manner in the rich text editor.
   * If the cursor has selected a word, the word will be pre- and succeeded by the symbol.
   * If the cursor is placed somewhere in the text, the symbol will be inserted at that location.
   * @param symbol that is to be placed in the text
   * @author Ycreak
   */
  public add_symbol(symbol: string): void {
    const range = this.editor_instance.getSelection();
    if (range) {
      if (range.length == 0) {
        // insert the symbol at the cursor location
        this.editor_instance.insertText(range.index, symbol, true, 'user');
        //FIXME: the next line makes sure ngModel is updated. This is a bug with the ngx-quill package
        this.editor_instance.insertText(range.index, '', 'user');
      } else {
        // if there is a selection, insert symbol before and after selection
        if (symbol == '⟨' || symbol == '⟩') {
          this.editor_instance.insertText(range.index, '⟨', 'user');
          this.editor_instance.insertText(range.index + range.length + 1, '⟩', 'user');
        } else {
          this.editor_instance.insertText(range.index, symbol, 'user');
          this.editor_instance.insertText(range.index + range.length + 1, symbol, 'user');
        }
      }
    }
  }
}
