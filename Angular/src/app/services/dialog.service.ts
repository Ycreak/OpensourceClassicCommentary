import { Injectable, Inject, Component } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TemplateRef, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {


  constructor(
    private dialog: MatDialog, 

  ) { }

  // Opens dialog for the about information
  public OpenAbout(): void {
    // const scrollStrategy = this.overlay.scrollStrategies.reposition();

    const dialogRef = this.dialog.open(ShowAboutDialog, 
      {
      autoFocus: false, // To allow scrolling in the dialog
      maxHeight: '90vh' //you can adjust the value as per your view
      });
  }

  /**
   * Opens a confirmation dialog with the provided message
   * @param message shows text about what is happening
   * @param item the item that is about to change
   */
  public OpenConfirmationDialog(message, item): Observable<boolean>{
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: 'auto',
      data: {
        message: message,
        item: item,
      }
    });  
    return dialogRef.afterClosed(); // Returns observable.
  }
}

// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: '../dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

/**
 * Class to show a confirmation dialog when needed. 
 * Shows whatever data is given
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