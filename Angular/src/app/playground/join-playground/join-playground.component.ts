// Library imports
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '@oscc/api.service';

@Component({
  selector: 'app-join-playground',
  templateUrl: './join-playground.component.html',
  styleUrls: ['./join-playground.component.scss'],
})
export class JoinPlaygroundComponent implements OnInit {
  protected name: string;
  protected playgrounds: string[] = [];

  protected selected_playground: string;
  protected no_playgrounds = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<JoinPlaygroundComponent>,
    protected api: ApiService
  ) {
    this.name = dialog_data.name;
  }

  ngOnInit(): void {
    this.api.get_shared_playgrounds({ user: this.name }).subscribe((playgrounds) => {
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
