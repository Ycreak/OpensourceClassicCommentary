import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  message = 'status: N/A' ;
  passwd = '';
  hide = true;

  constructor(public authService: AuthService, public router: Router) {
  }

  ngOnInit() {
    if(this.authService.isLoggedIn) {
      this.message = 'status: logged in'
    }
  }


  public Login(passwd) {
    this.authService.login(passwd)
    // .subscribe((res) => {
    //   if (this.authService.isLoggedIn) {
    //     const redirect = this.authService.redirectUrl ? this.router.parseUrl(this.authService.redirectUrl) : 'login';
    //     this.message = 'status: logged in'

    //     // this.router.navigateByUrl(redirect);
    //   }
    // });
  }

}