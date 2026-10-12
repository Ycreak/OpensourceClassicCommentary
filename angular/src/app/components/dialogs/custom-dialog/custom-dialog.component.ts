/**
 * Class to show a dialog with the provided content.
 * The provided 'data' is shown inside this editor.
 */
import { Component, inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeHtmlPipe } from '@oscc/pipes/safeHtml.pipe';

@Component({
  selector: 'app-custom-dialog',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['../dialogs.scss', './custom-dialog.component.scss'],
})
export class CustomDialogComponent {
  dialogRef = inject<MatDialogRef<CustomDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
}
