/**
 * The auth service handles everything related to the authentication
 * of a user. Furthermore, it handles the sandbox environment depending
 * on the role the user has.
 */

import { Injectable } from '@angular/core';
import { environment } from '@src/environments/environment';

//Service imports
import { SandboxService } from '@oscc/services/sandbox.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private sandbox: SandboxService) {}

  private permissions = {
    admin: ['create', 'read', 'update', 'delete', 'publish'],
    teacher: ['create', 'read', 'update', 'delete'],
    student: ['create', 'read', 'update'],
  };

  redirectUrl: string;

  private token_key = 'oscc_jwt_token';

  public token: string | null = typeof window !== 'undefined' ? localStorage.getItem(this.token_key) : null;

  public is_logged_in = environment.is_logged_in || !!this.token;
  public current_user_name: string = environment.current_user_name;
  public current_user_role: string = environment.current_user_role;

  public magic_phrase = 'Naevius';

  /**
   * Returns the JWT that is used to authenticate with the API, or null
   * when the user is not logged in.
   * @return (string)
   */
  public get_token(): string | null {
    return this.token;
  }

  /**
   * Login a user based on the data provided.
   * Getting here means the server approved login
   * @param user (object) which contains the username, role and token
   */
  public login_user(user: any): void {
    this.current_user_name = user.username;
    this.current_user_role = user.role;
    this.is_logged_in = true;

    // Store the JWT so we can authenticate with the API and survive a page reload.
    if (user.token && typeof window !== 'undefined') {
      this.token = user.token;
      localStorage.setItem(this.token_key, this.token);
    }

    // Now that we are logged in, let the sandbox service determine
    // what sandbox to activate.
    this.sandbox.activate(this.current_user_name, this.current_user_role);
  }

  /**
   * Logs out the user. Clears the locally stored token and resets the
   * current user to the default guest.
   */
  public logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.token_key);
    }
    this.is_logged_in = false;
    this.current_user_name = environment.current_user_name;
    this.current_user_role = environment.current_user_role;
    this.sandbox.current_sandbox = 'admin';
  }

  /**
   * Checks if the current user is a teacher
   */
  public is_teacher(): boolean {
    return this.current_user_role == 'teacher' || this.current_user_role == 'admin';
  }

  /**
   * Checks if the given user role has the permission to perform the given request.
   * Follows the CRUD philosophy.
   * @param request (string)
   * @param role (string)
   * @return boolean
   */
  public has_permission(request: string, role: string): boolean {
    return this.permissions[role].includes(request);
  }
}
