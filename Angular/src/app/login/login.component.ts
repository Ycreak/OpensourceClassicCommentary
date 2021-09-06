import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Password hiding in dialog
  hide = true;

  // Login form
  login_form = this.formBuilder.group({
    username: '',
    password: '',
  });

  constructor(
    public authService: AuthService, 
    public router: Router,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private utility: UtilityService,
    ) {
  }

  ngOnInit() {
  }

  onSubmit(): void {
    // Process checkout data here
    console.log('Your login information', this.login_form.value);
    this.api.Login_user(this.login_form.value).subscribe(
      res => this.authService.Login_user(res), err => this.utility.HandleErrorMessage(err)
    );
  }

  // public Login(passwd) {
  //   this.authService.login(passwd)
  //   // .subscribe((res) => {
  //   //   if (this.authService.isLoggedIn) {
  //   //     const redirect = this.authService.redirectUrl ? this.router.parseUrl(this.authService.redirectUrl) : 'login';
  //   //     this.message = 'status: logged in'
  //   //     // this.router.navigateByUrl(redirect);
  //   //   }
  //   // });
  // }

}