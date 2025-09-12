/**
 * Class to show a dialog with the provided content.
 * The provided 'data' is shown inside this editor.
 */
import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeHtmlPipe } from '@oscc/pipes/safeHtml.pipe';

@Component({
  selector: 'app-custom-dialog',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['../dialogs.scss'],
})
export class CustomDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CustomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
