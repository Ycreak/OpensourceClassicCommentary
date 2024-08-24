/**
 * This service allow components to connect to the websocket server and send/receive messages
 */

import { Injectable } from '@angular/core';
import { AuthService } from '@oscc/auth/auth.service';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WebsocketsService {
  public active: boolean;
  public room_identifier: string;

  constructor(
    private socket: Socket,
    private auth_service: AuthService
  ) {
    this.active = false;
  }

  /**
   * Joins the given websockets room
   * @param room (string)
   */
  public connect(room: string): void {
    this.socket.emit('join', { username: this.auth_service.current_user_name, room: room });
  }
  /**
   * Disconnects from the given websockets room
   * @param room (string)
   */
  public disconnect(room: string): void {
    this.socket.emit('leave', { username: this.auth_service.current_user_name, room: room });
  }

  /**
   * Sends a json to the json endpoint
   * @param json (object)
   */
  public send_json(json: object): void {
    this.socket.emit('json', json);
  }

  /**
   * Subscription for the json events send by the websocket
   * @return Observable
   */
  public get_messages() {
    return this.socket.fromEvent('json').pipe(map((data: any) => data));
  }
}
