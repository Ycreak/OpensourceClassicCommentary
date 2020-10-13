import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = false;
  redirectUrl: string;

  //TODO: self evident.
  public login(passwd){
    if(passwd == 'StackCanary'){
      this.isLoggedIn = true;
    }
  }
}
