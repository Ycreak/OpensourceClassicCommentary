import { Injectable } from '@angular/core';
import { environment } from '@src/environments/environment';

import { UtilityService } from '../utility.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private utility: UtilityService) {}

  redirectUrl: string;

  is_logged_in = environment.is_logged_in;
  current_user_name: string = environment.current_user_name;
  current_user_role: string = environment.current_user_role;

  magic_phrase = 'Naevius';

  public login_user(user: any) {
    // Getting here means the server approved login
    this.current_user_name = user.username;
    this.current_user_role = user.role;
    this.is_logged_in = true;
  }
}
