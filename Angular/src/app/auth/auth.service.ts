import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = true;
  isStudent = false;
  isTeacher = true;
  redirectUrl: string;

  //TODO: self evident.
  public login(passwd){
    if(passwd == 'StackCanary'){
      this.isLoggedIn = true;
      this.isTeacher = true;
    }
    if(passwd == 'StudentCanary'){
      this.isStudent = true;
      this.isLoggedIn = true;
    }    
  }
}
