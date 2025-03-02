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

@Injectable({
  providedIn: 'root'
})
export class SandboxService {
 
  // Name of the current sandbox. Always defaults to the admin
  // sandbox, as that is the one we publish to the outside world.
  public current_sandbox = 'admin';

  constructor() { }

  /**
   * Activates a sandbox. This is done based on the data in the authService.
   * For example, if the user thas has logged in is a teachter, the sandbox will
   * be set accordingly.
   */
  public activate(user_name: string, user_role: string): void {
    switch(user_role) {
      case 'admin':
        // The admin user uses the admin sandbox, which is the main sandbox
        this.current_sandbox = user_role 
        break;
      case 'teacher':
        // The teacher user uses a sandbox with the same name as their name
        this.current_sandbox = user_name 
        break;
      default:
        console.debug('Sandbox cannot be set yet for this current user role')
    } 
  }

  /**
   * Returns the name of the current sandbox. If the current sandbox is the admin one,
   * we return the string "Main", as it sounds just a bit nicer.
   * @return string of sandbox name
   */
  public get_name(): string {
    return this.current_sandbox == 'admin' ? 'main' : this.current_sandbox;
  }
}
