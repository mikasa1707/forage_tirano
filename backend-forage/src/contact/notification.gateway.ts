import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    handleConnection() {
        console.log('Client connecté');
    }

    handleDisconnect() {
        console.log('Client déconnecté');
    }

    emitNewMessage() {
        this.server.emit('new-message');
    }
    
    emitUpdate() {
        this.server.emit('message-read');
    }
}