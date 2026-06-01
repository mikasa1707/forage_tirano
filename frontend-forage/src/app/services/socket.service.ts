import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {

    private socket: Socket;

    constructor() {
        this.socket = io(`${environment.api}`);
    }

    onNewMessage(callback: () => void) {
        this.socket.on('new-message', callback);
    }

    offNewMessage() {
        this.socket.off('new-message');
    }

    onMessageRead(callback: () => void) {
        this.socket.on('message-read', callback);
    }

    disconnect() {
        this.socket.disconnect();
    }
}