import { Injectable, Inject, Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ApiService } from '@oscc/api.service';
import { BibliographyComponent } from '@oscc/dashboard/bibliography/bibliography.component';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * This service handles the dialogs used in the OSCC
 */

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Function to open the about dialog
   * @author Ycreak
   */
  public open_about_dialog(): void {
    this.dialog.open(ShowAboutDialogComponent, {
      autoFocus: false, // To allow scrolling in the dialog
      maxHeight: '90vh', //you can adjust the value as per your view
    });
  }

  /**
   * Opens a confirmation dialog with the provided message
   * @param message shows text about what is happening
   * @param item the item that is about to change
   * @author Ycreak
   */
  public open_confirmation_dialog(message, item): Observable<boolean> {
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
   * This function handles the settings dialog. Settings are passed in the data object.
   * @param settings oscc_settings object with all settings that can be changed
   * @returns Observable with the oscc_settings object if successful
   * @author Ycreak
   * TODO: have a close button that discards changes?
   */
  public open_settings_dialog(settings): Observable<string> {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: 'auto',
      height: 'auto',
      data: settings,
    });
    return dialogRef.afterClosed(); // Returns observable.
  }

  /**
   * Opens a dialog that shows the provided content
   * @param content that is to be shown
   * @author Ycreak
   */
  public open_custom_dialog(content): void {
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
 * Class to show the about dialogs
 */
@Component({
  selector: 'app-about-dialog',
  templateUrl: '../dialogs/about-dialog.html',
  styleUrls: ['../dialogs/dialogs.scss'],
})
export class ShowAboutDialogComponent {}

/**
 * Class to show a confirmation dialog when needed.
 * Shows whatever data is given via the public variable 'data'
 */
@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: '../dialogs/confirmation-dialog.html',
  styleUrls: ['../dialogs/dialogs.scss'],
})
export class ConfirmationDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
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

/**
 * Class to show a dialog with the provided content.
 * The provided 'data' is shown inside this editor.
 */
@Component({
  selector: 'app-custom-dialog',
  templateUrl: '../dialogs/custom-dialog.html',
  styleUrls: ['../dialogs/dialogs.scss'],
})
export class CustomDialogComponent {
  constructor(public dialogRef: MatDialogRef<CustomDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {}
}

/**
 * Class to show the settings dialog.
 * The provided 'data' is used to communicate the settings.
 */
@Component({
  selector: 'app-settings-dialog',
  templateUrl: '../dialogs/settings-dialog.html',
  styleUrls: ['../dialogs/dialogs.scss'],
})
export class SettingsDialogComponent {
  @ViewChild('dragtooltip_icon') dragtooltip_icon: MatTooltip;

  protected tooltips = {
    dragging_disabled: 'Disallows moving fragments by dragging them',
    fragment_order_gradient:
      'Enables a color gradient that shows the original order of the fragments, from a lighter to a darker color',
    show_headers: 'Show fragment headers that include data about the fragment',
    show_line_names: 'Show the name or number of each line of each fragment',
    auto_scroll_linked_fragments: 'Automatically scrolls linked fragments into view if possible',
  };

  constructor(public dialogRef: MatDialogRef<SettingsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {}

  protected toggle_tooltip(tooltip) {
    if (tooltip.disabled) {
      tooltip.disabled = false;
      tooltip.show();
    } else {
      tooltip.disabled = true;
      tooltip.hide();
    }
  }

  protected disable_tooltip(tooltip) {
    tooltip.disabled = true;
    tooltip.hide();
  }
}
