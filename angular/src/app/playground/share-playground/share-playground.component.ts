// Library imports
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';

// Service imports
import { ApiService } from '@oscc/api.service';

// Model imports
import { Playground_user } from '@oscc/models/api/Playground_user';

@Component({
  selector: 'app-share-playground',
  templateUrl: './share-playground.component.html',
  styleUrls: ['./share-playground.component.scss'],
})
export class SharePlaygroundComponent implements OnInit {
  protected users: Playground_user[] = [];

  protected form = new FormGroup({
    users: new FormArray([]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog_data: any,
    public dialogRef: MatDialogRef<SharePlaygroundComponent>,
    protected api: ApiService
  ) {
    this.users = dialog_data.users;
  }

  ngOnInit(): void {
    // Fill the user form field array
    this.users.forEach((user: Playground_user) => {
      this.add_user(user.name, user.role);
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
    const playground_users: Playground_user[] = [];
    // Cast the form values to a playground user object and return it
    users.value.forEach((user: any) => {
      playground_users.push(new Playground_user({ name: user.name, role: user.role }));
    });
    this.dialogRef.close(playground_users);
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
  protected add_user(name: string, role: string): void {
    const new_user = new FormGroup({
      name: new FormControl(name),
      role: new FormControl(role, [
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.required,
        Validators.pattern('[a-zA-z0-9]*'),
      ]),
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
