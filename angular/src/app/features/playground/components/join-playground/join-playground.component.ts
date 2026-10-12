/**
 * Component shows an input and returns the value that has been provided.
 */

// Library imports
import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogClose, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-join-playground',
  templateUrl: './join-playground.component.html',
  styleUrls: ['./join-playground.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogClose,
    MatIconModule,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogActions,
  ],
})
export class JoinPlaygroundComponent {
  dialogRef = inject<MatDialogRef<JoinPlaygroundComponent>>(MatDialogRef);

  protected name: string;

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
