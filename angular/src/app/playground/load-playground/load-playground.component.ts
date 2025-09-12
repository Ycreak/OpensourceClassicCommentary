// Library imports
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogClose,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';

// Service imports
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-load-playground',
  templateUrl: './load-playground.component.html',
  styleUrls: ['./load-playground.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogClose,
    MatIconModule,
    MatDialogContent,
    NgIf,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    MatDialogActions,
  ],
})
export class LoadPlaygroundComponent implements OnInit {
  protected name: string;
  protected playgrounds_created_by_me: any[] = [];
  protected playgrounds_shared_with_me: any[] = [];

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
    // Get all playgrounds from the index
    const playgrounds = this.api.index.filter((item: any) => item.document_type === 'playground');

    if (playgrounds.length == 0) {
      this.no_playgrounds = true;
    }

    // Find all playgrounds that are created by the current user
    this.playgrounds_created_by_me = playgrounds.filter(
      (item: any) => item.created_by === this.auth_service.current_user_name
    );

    // Find all playgrounds that are shared with the user, but not created by them
    this.playgrounds_shared_with_me = playgrounds.flatMap((document) =>
      document.users.find((user: any) => user.name === this.auth_service.current_user_name) ? [document] : []
    );
    this.playgrounds_shared_with_me = this.playgrounds_shared_with_me.filter(
      (item: any) => item.created_by != this.auth_service.current_user_name
    );
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }
}
