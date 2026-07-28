import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SamplesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  /** Notifica a todos los clientes que una muestra fue actualizada */
  emitSampleUpdated(sample: any) {
    this.server.emit('sample:updated', sample);
  }

  /** Notifica que se creó una nueva muestra */
  emitSampleCreated(sample: any) {
    this.server.emit('sample:created', sample);
  }
}
