import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Login level should be an integer. 0 for guest, 1 for student, 2 for teacher en 3 for admin.
  is_logged_in = true;
  is_student = false;
  is_teacher = true;
  isGuest = false;

  role: string;
  
  redirectUrl: string;


  logged_user : string;
  magic_phrase : string = 'Accius';

  public Login_user(res, username){
    // Getting here means the server approved login
    this.is_logged_in = true;
    this.logged_user = username;
    this.role = res.body;
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
