import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';


import { DialogService } from '../services/dialog.service';
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
  login_expanded : boolean = true; // to toggle create and login
  create_expanded : boolean = false;

  // Login form
  login_form = this.formBuilder.group({
    username: '',
    password: '',
  });

  create_form = this.formBuilder.group({
    username: '',
    password1: '',
    password2: '',
    magic_word: '',
  });

  constructor(
    public authService: AuthService, 
    public router: Router,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private utility: UtilityService,
    private dialog: DialogService,
    ) {
  }

  ngOnInit() {
  }

  public submit_login(form): void {
    // Process checkout data here
    this.api.Login_user(form).subscribe(
      res => {
        this.authService.Login_user(res, form.username)
        this.login_expanded = false;
        this.create_expanded = false;
      }, err => this.utility.HandleErrorMessage(err)
    );
  }

  public submit_create(form): void {

    if(form.username.length < 5 || form.password1.length < 5){
      this.utility.OpenSnackbar('Please provide proper details');
      return
    }

    console.log('Provided magic word:', form.magic_word)

    if(form.magic_word != this.authService.magic_phrase){
      this.utility.OpenSnackbar('That is not the magic word');
      return
    }
  
    if(form.password1 == form.password2){
      this.dialog.OpenConfirmationDialog('Are you sure you want to CREATE this user?', form.username).subscribe(result => {
        if(result){
          this.api.Create_user({'username':form.username,'password':form.password1}).subscribe(
            res => {
              this.utility.HandleErrorMessage(res),
              this.login_expanded = false;
              this.create_expanded = false;
            },
            err => this.utility.HandleErrorMessage(err)
          );
        }
      });
    }
    else{
      this.utility.OpenSnackbar('Passwords do not match.');
    }



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