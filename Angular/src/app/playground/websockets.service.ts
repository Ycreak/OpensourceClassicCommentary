import { Injectable } from '@angular/core';
import { AuthService } from '@oscc/auth/auth.service';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

import { Playground } from '@oscc/models/Playground';

@Injectable({
  providedIn: 'root'
})
export class WebsocketsService {

  constructor(
    private socket: Socket,
    private auth_service: AuthService,


  ) { }
 
  public load_playground(){

  }

  public save_playground(canvas: any, name: string) {
    const playground = new Playground({
      owner: this.auth_service.current_user_name, 
      name: name, 
      canvas: canvas.toJSON()
    });
    console.log('ply', playground)
  }

  public login(): void {
    this.socket.emit('sign_in', {id: 0, name: this.auth_service.current_user_name});
  }
  sendMessage(message: any) {
    this.socket.emit('message', message);
  }
  getMessage() {
    return this.socket.fromEvent('message').pipe(map((data: any) => data));
  }
}
