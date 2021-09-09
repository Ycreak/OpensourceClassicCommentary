import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  is_logged_in = true;
  is_student = false;
  is_teacher = true;
  isGuest = false;
  redirectUrl: string;

  logged_user = 'Antje'

  public Login_user(res, username){
    // Getting here means the server approved login
    this.is_logged_in = true;
    this.logged_user = username;
    // Now set the role the server returns to us
    switch(res.body) { 
      case 'teacher': { 
        this.is_teacher = true; 
        break; 
      } 
      case 'student': { 
        this.is_student = true; 
        break; 
      } 
      default: { 
        this.isGuest = true; 
        break; 
      } 
   }
  }
}
