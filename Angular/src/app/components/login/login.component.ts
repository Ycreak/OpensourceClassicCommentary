import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FragmentsComponent } from '../fragments/fragments.component'
import {ProfileComponent} from '../profile/profile.component'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
    api : ProfileComponent =  new ProfileComponent(this.httpClient, this.modalService);


  username: string; // Linked via ngModel.
  password: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService,
    private modalService: NgbModal, 
    private httpClient: HttpClient, 
  ) { }

  ngOnInit() {
  }

  onLoginSubmit(){
    // console.log(this.username);
    const user = {
      username: this.username,
      password: this.password
    };

    const type = true;

    this.authService.authenticateUser(user).subscribe(data => {
      //  // What will data give us? Returns an object with User info.
      if (1 === 1){
        // this.authService.storeUserData(data.token, data.user);
        this.flashMessage.show('You are now loggin in', {
          cssClass: 'alert-success',
          timeout: 5000});
        this.router.navigate(['dashboard']);

        //console.log(data);
      } else {
        this.flashMessage.show('Something went wrong', {
          cssClass: 'alert-danger',
          timeout: 5000
        });
        this.router.navigate(['login']);
      }
    }); // Returns observable.

  }



}


