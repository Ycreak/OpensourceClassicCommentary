import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = true;
  isStudent = false;
  isTeacher = true;
  isGuest = false;
  redirectUrl: string;

  public Login_user(res){
    // Getting here means the server approved login
    this.isLoggedIn = true;
    // Now set the role the server returns to us
    switch(res.body) { 
      case 'teacher': { 
        this.isTeacher = true; 
        break; 
      } 
      case 'student': { 
        this.isStudent = true; 
        break; 
      } 
      default: { 
        this.isGuest = true; 
        break; 
      } 
   }
  }
}
