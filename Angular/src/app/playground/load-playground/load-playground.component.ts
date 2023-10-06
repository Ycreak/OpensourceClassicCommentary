// Library imports
import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-load-playground',
  templateUrl: './load-playground.component.html',
  styleUrls: ['./load-playground.component.scss'],
})
export class LoadPlaygroundComponent implements AfterViewInit {
  protected name: string;
  protected playgrounds: string[];

  protected selected_playground: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<LoadPlaygroundComponent>,
    private api: ApiService,
    private utility: UtilityService
  ) {
    this.name = dialog_data.name;
    this.playgrounds = dialog_data.playgrounds;
  }

  ngAfterViewInit(): void {
    this.api.get_playground_names({ owner: this.name }).subscribe((playgrounds) => {
      if (playgrounds.length > 0) {
        this.playgrounds = playgrounds;
      } else {
        this.utility.open_snackbar('No playgrounds found');
      }
    });
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
