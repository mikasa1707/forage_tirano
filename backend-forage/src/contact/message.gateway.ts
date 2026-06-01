import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MessageGateway {
  @WebSocketServer()
  server;
}