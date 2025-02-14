/**
 * Contains all information related to the sandbox. Every teachers receives a sandbox.
 * Within this sandbox, they can invite students to work on documents. Students receive
 * permissions within this sandbox.
 *
 * In the dashboard, teachers can edit only the documents from their sandbox.
 * In the frontend, users can view both their sandboxed as public documents.
 *  - The user can toggle whether to show public documents or only sandboxed ones. 
 *  - If the sandbox is enabled, only retrieve sandboxed documents from the api
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SandboxService {
  
  public sandbox_enabled = false;

  constructor() { }
}
