// Library imports
import { Component } from '@angular/core';
import { AuthService } from '@oscc/auth/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

// Component imports
import { DialogService } from '@oscc/services/dialog.service';
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';

import { User } from '@oscc/models/User';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  hide_password = true; // password hiding in dialog
  login_form_expanded = true; // to toggle user login form field
  create_form_expanded = false; // to toggle the user create form field

  // Form used to login existing user
  login_form = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  // Form used to create new user
  create_form = new FormGroup({
    username: new FormControl('', [
      Validators.maxLength(20),
      Validators.required,
      Validators.pattern("[a-zA-z0-9 .'_-]*"),
    ]),
    password1: new FormControl('', [
      Validators.minLength(5),
      Validators.maxLength(30),
      Validators.required,
      Validators.pattern("[a-zA-z0-9$&+,:;=?@#|'<>.^*()%!-]*"),
    ]),
    password2: new FormControl('', [
      Validators.minLength(5),
      Validators.maxLength(30),
      Validators.required,
      Validators.pattern("[a-zA-z0-9$&+,:;=?@#|'<>.^*()%!-]*"),
    ]),
    magic_word: new FormControl('', [Validators.required]),
  });

  constructor(
    public auth_service: AuthService,
    public router: Router,
    protected api: ApiService,
    protected utility: UtilityService,
    private dialog: DialogService,
    public dialogRef: MatDialogRef<LoginComponent>
  ) {}

  public submit_login(login_form: any): void {
    // Create a user session for the auth_service to fill in
    this.api.spinner_on();
    const user = new User({
      username: login_form.value.username,
      password: encodeURIComponent(login_form.value.password),
    });

    this.api.login_user(user).subscribe({
      next: (approved_user) => {
        this.auth_service.login_user(approved_user);
        this.utility.open_snackbar('Login successful');
        this.dialogRef.close(); // Close the login screen overlay
        this.api.spinner_off();
      },
      error: (err) => this.api.show_server_response(err),
    });
  }

  /**
   * Handle the creation of a user
   * @param form provided by the user
   * @returns void, but does request api for creation of a user
   */
  public submit_create(form: any): void {
    // Check if the magic word is correct
    if (form.magic_word != this.auth_service.magic_phrase) {
      this.utility.open_snackbar('That is not the magic word');
      return;
    }
    // Check if the two given passwords are identical. If so, show confirmation dialog.
    // If succesful, request the creation of the user from the api
    if (form.password1 == form.password2) {
      this.dialog
        .open_confirmation_dialog('Are you sure you want to CREATE this user?', form.username)
        .subscribe((result) => {
          if (result) {
            this.api.spinner_on();
            const user = new User({
              username: form.username,
              password: encodeURIComponent(form.password1),
            });
            this.api.create_user(user).subscribe({
              next: () => {
                this.login_form_expanded = false;
                this.create_form_expanded = false;
                this.api.spinner_off();
                // Also log in the new user after user creation
                this.api.spinner_on();
                this.submit_login({
                  value: { username: this.create_form.value.username, password: this.create_form.value.password1 },
                });
              },
              error: (err) => this.api.show_server_response(err),
            });
          }
        });
    } else {
      this.utility.open_snackbar('Passwords do not match.'); // TODO: Let FormControl handle this
    }
  }

  //TODO: close login dialog after succesful login
  // public Login(passwd) {
  //   this.auth_service.login(passwd)
  //   // .subscribe((res) => {
  //   //   if (this.auth_service.isLoggedIn) {
  //   //     const redirect = this.auth_service.redirectUrl ? this.router.parseUrl(this.auth_service.redirectUrl) : 'login';
  //   //     this.message = 'status: logged in'
  //   //     // this.router.navigateByUrl(redirect);
  //   //   }
  //   // });
  // }
}
