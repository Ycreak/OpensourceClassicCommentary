import { Injectable, Inject, Component } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

/**
 * This service handles the dialogs used in the OSCC
 */

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: MatDialog, 
  ) { }

  /**
   * Function to open the about dialog
   * @author Ycreak
   */
  public open_about_dialog(): void {
    const dialogRef = this.dialog.open(ShowAboutDialog, {
      autoFocus: false, // To allow scrolling in the dialog
      maxHeight: '90vh' //you can adjust the value as per your view
    });
  }

  /**
   * Opens a confirmation dialog with the provided message
   * @param message shows text about what is happening
   * @param item the item that is about to change
   * @author Ycreak
   */
  public open_confirmation_dialog(message, item): Observable<boolean>{
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: 'auto',
      data: {
        message: message,
        item: item,
      }
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
  public open_wysiwyg_dialog(content, config): Observable<string>{
    const dialogRef = this.dialog.open(WYSIWYGDialog, {
      disableClose: true, //FIXME: this is a hack. clicking outside should return the data to the user
      width: '90%',
      height: '75%',
      data: {
        content: content,
        config: config,
      }
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
  public open_settings_dialog(settings): Observable<string>{
    const dialogRef = this.dialog.open(SettingsDialog, {
      disableClose: true, //FIXME: this is a hack. clicking outside should return the data to the user
      width: 'auto',
      height: 'auto',
      data: settings
    });  
    return dialogRef.afterClosed(); // Returns observable.
  }

}

/**
 * Class to show the about dialogs
 */
@Component({
  selector: 'about-dialog',
  templateUrl: '../dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

/**
 * Class to show a confirmation dialog when needed. 
 * Shows whatever data is given via the public variable 'data'
 */
@Component({
  selector: 'confirmation-dialog',
  templateUrl: '../dialogs/confirmation-dialog.html',
})
export class ConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data) { }
    
    onNoClick(): void {
      this.dialogRef.close();
    }
}

/**
 * Class to show the rich text editor dialog. 
 * The provided 'data' is shown inside this editor.
 */
@Component({
  selector: 'wysiwyg-dialog',
  templateUrl: '../dialogs/wysiwyg-dialog.html',
})
export class WYSIWYGDialog {

  constructor(
    public dialogRef: MatDialogRef<WYSIWYGDialog>,
    @Inject(MAT_DIALOG_DATA) public data) { 
  }
}

/**
 * Class to show the settings dialog. 
 * The provided 'data' is used to communicate the settings.
 */
@Component({
  selector: 'settings-dialog',
  templateUrl: '../dialogs/settings-dialog.html',
})
export class SettingsDialog {
  constructor(
    public dialogRef: MatDialogRef<SettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public data) { 
  }
}