/**
 * This service allows components to easily open a dialog and interact with them.
 */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '@oscc/dialogs/confirmation/confirmation-dialog.component';
import { AboutDialogComponent } from '@oscc/dialogs/about/about-dialog.component';
import { SettingsDialogComponent } from '@oscc/dialogs/settings/settings-dialog.component';
import { SettingsService } from './settings.service';
import { ColumnBibliographyComponent } from '@oscc/dialogs/column-bibliography/column-bibliography.component';
import { CustomDialogComponent } from '@oscc/dialogs/custom-dialog/custom-dialog.component';
import { WYSIWYGDialogComponent } from '@oscc/dialogs/wysiwyg/wysiwyg-dialog.component';

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
   * Function to handle the fragment publish dialog
   */
  public open_fragment_publish_dialog(): void {
    this.dialog.open(AboutDialogComponent, {
      autoFocus: false, // To allow scrolling in the dialog
      maxHeight: '90vh', //you can adjust the value as per your view
    });
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
   */
  public open_wysiwyg_dialog(content: any): Observable<string> {
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
