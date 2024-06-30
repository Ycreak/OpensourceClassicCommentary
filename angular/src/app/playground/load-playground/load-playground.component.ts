// Library imports
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Service imports
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';

@Component({
  selector: 'app-load-playground',
  templateUrl: './load-playground.component.html',
  styleUrls: ['./load-playground.component.scss'],
})
export class LoadPlaygroundComponent implements OnInit {
  protected name: string;
  protected playgrounds_created_by_me: string[] = [];
  protected playgrounds_shared_with_me: string[] = [];

  protected selected_playground: string;
  protected no_playgrounds = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<LoadPlaygroundComponent>,
    protected api: ApiService,
    private auth_service: AuthService
  ) {
    this.name = dialog_data.user;
  }

  ngOnInit(): void {
    this.api.get_playground_names({ user: this.name }).subscribe((playgrounds) => {
      if (playgrounds.length > 0) {
        // Divide the retrieved playgrounds in those created by the current user, and those that are shared with them
        this.playgrounds_created_by_me = playgrounds.filter(
          (obj: any) => obj.created_by == this.auth_service.current_user_name
        );
        this.playgrounds_shared_with_me = playgrounds.filter(
          (obj: any) => obj.created_by != this.auth_service.current_user_name
        );
      } else {
        this.no_playgrounds = true;
      }
    });
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
