// Library imports
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '@oscc/api.service';

@Component({
  selector: 'app-load-playground',
  templateUrl: './load-playground.component.html',
  styleUrls: ['./load-playground.component.scss'],
})
export class LoadPlaygroundComponent implements OnInit {
  protected name: string;
  protected playgrounds: string[] = [];

  protected selected_playground: string;
  protected no_playgrounds = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<LoadPlaygroundComponent>,
    protected api: ApiService
  ) {
    this.name = dialog_data.owner;
    this.playgrounds = dialog_data.playgrounds;
  }

  ngOnInit(): void {
    this.api.get_playground_names({ owner: this.name }).subscribe((playgrounds) => {
      console.log(playgrounds)
      if (playgrounds.length > 0) {
        this.playgrounds = playgrounds;
      } else {
        this.no_playgrounds = true;
      }
    });
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
