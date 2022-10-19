import { Injectable } from '@angular/core';
import { User } from '../models/User';

import { UtilityService } from '../utility.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  constructor(
    private utility: UtilityService,
    ) { }
  
  is_logged_in = true;
  
  redirectUrl: string;

  current_user_name: string = 'Lucus';
  current_user_role: string = 'teacher';

  magic_phrase : string = 'Naevius';

  public login_user(user){
    // Getting here means the server approved login
    this.is_logged_in = true;
    this.current_user_name = user.username;
    this.current_user_role = user.role;

  }
}
