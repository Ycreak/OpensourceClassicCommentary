import { Injectable } from '@angular/core';
import { AuthService } from '@oscc/auth/auth.service';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WebsocketsService {
  constructor(private socket: Socket, private auth_service: AuthService) {}

  public login(): void {
    this.socket.emit('sign_in', { id: 0, name: this.auth_service.current_user_name });
  }

  public sendMessage(message: any) {
    this.socket.emit('message', message);
  }

  public getMessage() {
    return this.socket.fromEvent('message').pipe(map((data: any) => data));
  }
}
