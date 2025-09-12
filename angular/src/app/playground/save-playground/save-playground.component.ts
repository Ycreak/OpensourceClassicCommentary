// Library imports
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-save-playground',
  templateUrl: './save-playground.component.html',
  styleUrls: ['./save-playground.component.scss'],
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
