import { Component, inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: '../dialogs.scss',
})
export class ConfirmationDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
