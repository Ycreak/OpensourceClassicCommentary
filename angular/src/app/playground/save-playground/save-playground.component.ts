// Library imports
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-save-playground',
  templateUrl: './save-playground.component.html',
  styleUrls: ['./save-playground.component.scss'],
})
export class SavePlaygroundComponent {
  protected name: string;
  protected playgrounds: string[];

  protected selected_playground: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<SavePlaygroundComponent>
  ) {
    this.name = dialog_data.name;
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
