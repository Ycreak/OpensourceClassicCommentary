// Library imports
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, FormArray } from '@angular/forms';

import { ApiService } from '@oscc/api.service';

@Component({
  selector: 'app-share-playground',
  templateUrl: './share-playground.component.html',
  styleUrls: ['./share-playground.component.scss'],
})
export class SharePlaygroundComponent implements OnInit {
  protected shared_with: string[] = [];

  protected form = new FormGroup({
    users: new FormArray([]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<SharePlaygroundComponent>,
    protected api: ApiService
  ) {
    this.shared_with = dialog_data.shared_with;
  }

  ngOnInit(): void {
    // Fill the user form field array
    this.shared_with.forEach((user: any) => {
      this.add_user(user.name, user.save, user.del);
    });
  }

  protected onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Retrieves all user names from the form and sends them back
   * @author Ycreak
   */
  protected onYesClick(): void {
    const users = this.form.get('users') as FormArray;
    this.dialogRef.close(users.value);
  }

  /**
   * Function to reset the fragment form
   * @author Ycreak
   */
  protected reset_form(): void {
    // First, remove all data from the form
    this.form.reset();
    // Second, remove the previously created FormArray controls and set new ones
    this.form.setControl('users', new FormArray([]));
  }

  /**
   * Adds a user to the form
   * @param user (string)
   * @author Ycreak
   */
  protected add_user(name: string, save: boolean, del: boolean): void {
    const new_user = new FormGroup({
      name: new FormControl(name),
      save: new FormControl(save),
      del: new FormControl(del),
    });
    const user_array = this.form.get('users') as FormArray;
    user_array.push(new_user);
  }

  /**
   * Remove a user from the form
   * @param index number of the item we want to delete
   * @author Ycreak
   */
  protected delete_user(index: number): void {
    const user_array = this.form.get('users') as FormArray;
    user_array.removeAt(index);
  }
}
