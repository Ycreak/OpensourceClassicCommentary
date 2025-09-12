/**
 * Component shows an input and returns the value that has been provided.
 */

// Library imports
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-join-playground',
  templateUrl: './join-playground.component.html',
  styleUrls: ['./join-playground.component.scss'],
})
export class JoinPlaygroundComponent {
  protected name: string;

  constructor(public dialogRef: MatDialogRef<JoinPlaygroundComponent>) {}

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
