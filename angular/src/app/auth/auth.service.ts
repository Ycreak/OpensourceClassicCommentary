/**
 * The auth service handles everything related to the authentication
 * of a user. Furthermore, it handles the sandbox environment depending
 * on the role the user has.
 */

import { Injectable } from '@angular/core';
import { environment } from '@src/environments/environment';

//Service imports
import {SandboxService} from '@oscc/services/sandbox.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private sandbox: SandboxService) {}

  redirectUrl: string;

  public is_logged_in = environment.is_logged_in;
  public current_user_name: string = environment.current_user_name;
  public current_user_role: string = environment.current_user_role;

  public magic_phrase = 'Naevius';

  /**
   * Login a user based on the data provided.
   * Getting here means the server approved login
   * @param user (object)
   */
  public login_user(user: any): void {
    this.current_user_name = user.username;
    this.current_user_role = user.role;
    this.is_logged_in = true;

    // Now that we are logged in, let the sandbox service determine 
    // what sandbox to activate.
    this.sandbox.activate();
  }

  /**
   * Checks if the current user is a teacher
   */
  public is_teacher(): boolean {
    return this.current_user_role == 'teacher' || this.current_user_role == 'admin';
  }
}
