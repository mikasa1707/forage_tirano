import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class SocketService {

  private socket: any;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.socket = io(`${environment.api}`);
    }
  }

  onNewMessage(callback: () => void) {
    this.socket?.on('new-message', callback);
  }

  offNewMessage(callback: () => void) {
    this.socket?.off('new-message', callback);
  }

  onMessageRead(callback: () => void) {
    this.socket?.on('message-read', callback);
  }

  offMessageRead(callback: () => void) {
    this.socket?.off('message-read', callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}