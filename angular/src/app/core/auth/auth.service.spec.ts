import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = false;
  redirectUrl: string;

  //login(): Observable<boolean> {
  //return of(true).pipe(
  //delay(1000),
  //tap((val) => (this.isLoggedIn = true))
  //);
  //}

  //logout(): void {
  //this.isLoggedIn = false;
  //}
}
