import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogClose,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-playground',
  templateUrl: './delete-playground.component.html',
  styleUrls: ['./delete-playground.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatDialogClose, MatIconModule, MatDialogContent, MatDialogActions],
})
export class DeletePlaygroundComponent {
  protected name: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<DeletePlaygroundComponent>
  ) {
    this.name = dialog_data.name;
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
