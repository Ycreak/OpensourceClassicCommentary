/**
 * This component handles the wysiwyg component, which uses the Quill Editor to help users
 * better edit their texts.
 */
import { Inject, Component } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BibliographyComponent } from '@oscc/dashboard/bibliography/bibliography.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-wysiwyg-dialog',
  standalone: true,
  imports: [MatDialogContent, QuillEditorComponent, FormsModule, MatButtonModule, MatDialogClose],
  templateUrl: './wysiwyg-dialog.component.html',
  styleUrl: '../dialogs.scss',
})
export class WYSIWYGDialogComponent {
  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<WYSIWYGDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {}

  editor_instance: any; // allows communication with the editor

  /**
   * Function to open the about dialog
   * @author Ycreak
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
