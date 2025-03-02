/**
 * Contains all information related to the sandbox. Every teachers receives a sandbox.
 * Within this sandbox, they can invite students to work on documents. Students receive
 * permissions within this sandbox.
 *
 * In the dashboard, teachers can edit only the documents from their sandbox.
 * In the frontend, as soon as a user logs in, they can only see their sandbox.
 *   If the sandbox is enabled, only retrieve relevant sandboxed documents from the api
 */

import { Injectable } from '@angular/core';
import {AuthService} from '@oscc/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SandboxService {
 
  // Name of the current sandbox. Always defaults to the admin
  // sandbox, as that is the one we publish to the outside world.
  public current_sandbox = 'admin';

  constructor(private auth_service: AuthService) { }

  /**
   * Activates a sandbox. This is done based on the data in the authService.
   * For example, if the user thas has logged in is a teachter, the sandbox will
   * be set accordingly.
   */
  public activate(): void {
    switch(this.auth_service.current_user_role) {
      case 'admin':
        // The admin user uses the admin sandbox, which is the main sandbox
        this.current_sandbox = this.auth_service.current_user_role 
        break;
      case 'teacher':
        // The teacher user uses a sandbox with the same name as their name
        this.current_sandbox = this.auth_service.current_user_name 
        break;
      default:
        console.debug('Sandbox cannot be set yet for this current user role')
    } 
  }
}
