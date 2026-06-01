import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketService {

    private socket: Socket;

    constructor() {
        this.socket = io('http://localhost:3000');
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