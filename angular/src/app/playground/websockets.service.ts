import { Injectable } from '@angular/core';
import { AuthService } from '@oscc/auth/auth.service';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WebsocketsService {
  public canvas: object;
  public active: boolean;

  constructor(
    private socket: Socket,
    private auth_service: AuthService
  ) {
    this.active = false;
  }

  public login(): void {
    this.socket.emit('sign_in', { id: 0, name: this.auth_service.current_user_name });
  }

  public sendMessage(message: any) {
    this.socket.emit('message', message);
  }

  public getMessage() {
    return this.socket.fromEvent('message').pipe(map((data: any) => data));
  }

  public propagate(incoming_canvas: object): void {
    console.log(incoming_canvas);

    console.log(this.canvas);
  }
}
