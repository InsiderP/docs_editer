import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import * as Y from 'yjs';
import { createClient } from 'redis';

const yDocs = new Map<string, Y.Doc>();
let ioServer: any; // Will be set in afterInit

// Redis setup
const redisPub = createClient();
const redisSub = createClient();
redisPub.connect();
redisSub.connect();

@WebSocketGateway({ namespace: '/collab', cors: true })
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly jwtService: JwtService) {
    // Subscribe to Redis for Yjs updates
    redisSub.subscribe('yjs-updates', (message) => {
      const { docId, update } = JSON.parse(message);
      let ydoc = yDocs.get(docId);
      if (!ydoc) {
        ydoc = new Y.Doc();
        yDocs.set(docId, ydoc);
      }
      Y.applyUpdate(ydoc, Buffer.from(update, 'base64'));
      if (ioServer) {
        ioServer.to(docId).emit('docUpdate', Buffer.from(update, 'base64'));
      }
    });
  }

  afterInit(server: any) {
    ioServer = server;
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token || client.handshake.headers['authorization'];
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const jwt = token.startsWith('Bearer ') ? token.slice(7) : token;
      const payload = this.jwtService.verify(jwt);
      (client as any).user = payload;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Handle user disconnect logic if needed
  }

  @SubscribeMessage('joinDoc')
  handleJoinDoc(@MessageBody() data: { docId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.docId);
    let ydoc = yDocs.get(data.docId);
    if (!ydoc) {
      ydoc = new Y.Doc();
      yDocs.set(data.docId, ydoc);
    }
    const state = Y.encodeStateAsUpdate(ydoc);
    client.emit('docInit', state);
  }

  @SubscribeMessage('editDoc')
  async handleEditDoc(@MessageBody() data: { docId: string; update: Uint8Array }, @ConnectedSocket() client: Socket) {
    let ydoc = yDocs.get(data.docId);
    if (!ydoc) {
      ydoc = new Y.Doc();
      yDocs.set(data.docId, ydoc);
    }
    Y.applyUpdate(ydoc, data.update);
    // Publish update to Redis for cross-instance sync
    const updateBase64 = Buffer.from(data.update).toString('base64');
    await redisPub.publish('yjs-updates', JSON.stringify({ docId: data.docId, update: updateBase64 }));
    // Broadcast to local clients (except sender)
    client.to(data.docId).emit('docUpdate', data.update);
  }
} 