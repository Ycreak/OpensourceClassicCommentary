/**
 * This service allows components to easily open a dialog and interact with them.
 */
import { Injectable, Inject, Component } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ApiService } from '@oscc/api.service';
import { BibliographyComponent } from '@oscc/dashboard/bibliography/bibliography.component';
import { ConfirmationDialogComponent } from '@oscc/dialogs/confirmation/confirmation-dialog.component';
import { AboutDialogComponent } from '@oscc/dialogs/about/about-dialog.component';
import { SettingsDialogComponent } from '@oscc/dialogs/settings/settings-dialog.component';
import { SettingsService } from './settings.service';
import { ColumnBibliographyComponent } from '@oscc/dialogs/column-bibliography/column-bibliography.component';
import { CustomDialogComponent } from '@oscc/dialogs/custom-dialog/custom-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';

/**
 * This service handles the dialogs used in the OSCC
 */

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(
    private settings: SettingsService,
    private dialog: MatDialog
  ) {}

  /**
   * Function to handle the about dialog
   */
  public open_about_dialog(): void {
    this.dialog.open(AboutDialogComponent, {
      autoFocus: false, // To allow scrolling in the dialog
      maxHeight: '90vh', //you can adjust the value as per your view
    });
  }

  /**
   * Opens a confirmation dialog with the provided message
   * @param message shows text about what is happening
   * @param item the item that is about to change
   */
  public open_confirmation_dialog(message: string, item: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: {
        message: message,
        item: item,
      },
    });
    return dialogRef.afterClosed(); // Returns observable.
  }

  /**
   * Function to handle the settings dialog. Will save changes to the settings object in the service.
   */
  public open_settings_dialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: 'auto',
      height: 'auto',
    });
    dialogRef.afterClosed().subscribe(() => {
      // Also save the settings in local storage
      this.settings.save_settings();
    });
  }

  /**
   * Opens a dialog that shows a wysiwyg editor to edit the provided content
   * @param content that is to be edited by the editor
   * @param config settings that are interpreted by the editor
   * @returns content that is edited by the editor
   * @author Ycreak
   */
  public open_wysiwyg_dialog(content): Observable<string> {
    const dialogRef = this.dialog.open(WYSIWYGDialogComponent, {
      disableClose: true,
      data: {
        content: content,
      },
    });
    return dialogRef.afterClosed(); // Returns observable.
  }

  /**
   * Opens a dialog that shows the bibliography for a column
   * @param content that is to be shown
   * @author Ycreak
   */
  public open_column_bibliography(content: any): void {
    this.dialog.open(ColumnBibliographyComponent, {
      width: '90%',
      height: '75%',
      data: {
        content: content,
      },
    });
  }
  /**
   * Opens a dialog that shows the provided content
   * @param content that is to be shown
   * @author Ycreak
   */
  public open_custom_dialog(content: any): void {
    this.dialog.open(CustomDialogComponent, {
      width: '90%',
      height: '75%',
      data: {
        content: content,
      },
    });
  }
}

/**
 * Class to show the rich text editor dialog.
 * The provided 'data' is shown inside this editor.
 */
@Component({
  selector: 'app-wysiwyg-dialog',
  templateUrl: '../dialogs/wysiwyg-dialog.html',
  styleUrls: ['../dialogs/dialogs.scss'],
  standalone: true,
  imports: [MatDialogContent, QuillEditorComponent, FormsModule, MatButtonModule, MatDialogClose],
})
export class WYSIWYGDialogComponent {
  constructor(
    private dialog: MatDialog,
    private api: ApiService,
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
