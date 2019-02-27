import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
// import { tokenNotExpired } from 'angular2-jwt';

// import { filter } from 'rxjs/operators';
// import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authToken: any; // Class property
  user: any;

  constructor(private http: HttpClient) { }

  registerUser(user) { // reach into backend api
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3000/users/register', user,{headers: new HttpHeaders()});
      // .pipe(map((res: any) => res.json())); // is observable. // not needed anymore.
      // Hocus Spocus, het werkt.
  }

  authenticateUser(user){
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3000/users/authenticate', user, {headers: new HttpHeaders()});
      // .pipe(map((res: any) => res.json())); // is observable. // not needed anymore.
      // Hocus Spocus, het werkt.
  }

  getProfile(){
    const headers = new HttpHeaders({
      'Authorization': this.authToken,
      'Content-Type': 'application/json'
    });

    // const headers = new Headers();
    this.loadToken();
    // headers.append('Authorization', this.authToken);
    // headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3000/users/profile', {headers: new HttpHeaders()});
  }

  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken(){
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn(){
    return tokenNotExpired();
  }

  logout(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

}

