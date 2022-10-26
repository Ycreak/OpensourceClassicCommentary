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
  
    
    redirectUrl: string;
    
    // For release
    // is_logged_in = false;
    // current_user_name: string = '';
    // current_user_role: string = '';
    

    is_logged_in = true;
    current_user_name: string = 'Lucus';
    current_user_role: string = 'teacher';

  magic_phrase : string = 'Naevius';

  public login_user(user){
    //FIXME: hack for the staging build
    const fruits = ["Matthew", "Antje", "Karel", "Basil", "Lucus", "Thomas"];
    if(fruits.includes(user.username)){
      this.is_logged_in = true;
      this.current_user_name = user.username;
      this.current_user_role = 'teacher';
    }

    // Getting here means the server approved login

  }
}
