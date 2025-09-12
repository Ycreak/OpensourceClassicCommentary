// Library imports
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogClose,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-save-playground',
  templateUrl: './save-playground.component.html',
  styleUrls: ['./save-playground.component.scss'],
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
    NgIf,
  ],
})
export class SavePlaygroundComponent {
  protected name: string;
  protected playgrounds: string[];

  // Denote whether the playground we want to save is a new one. If so, we will hide the save button
  protected new_playground = false;
  protected selected_playground: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<SavePlaygroundComponent>
  ) {
    this.name = dialog_data.name;
    if (this.name == undefined) {
      this.new_playground = true;
    }
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
