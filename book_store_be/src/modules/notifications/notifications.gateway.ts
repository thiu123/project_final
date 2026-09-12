import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { OrderStatus, PaymentMethod } from '../../constants/app.constants';

export const ADMIN_ROOM = 'admins';
export const NEW_ORDER_EVENT = 'order:new';

export interface NewOrderNotification {
  orderId: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  customer: string;
  createdAt: string;
}

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    const raw = client.handshake.auth?.token as string | undefined;
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_KEY'),
      });

      if (!payload.admin) {
        client.disconnect();
        return;
      }

      void client.join(ADMIN_ROOM);
      this.logger.log(`Admin ${payload.id} connected`);
    } catch {
      client.disconnect();
    }
  }

  notifyNewOrder(payload: NewOrderNotification): void {
    this.server.to(ADMIN_ROOM).emit(NEW_ORDER_EVENT, payload);
    this.logger.log(`Notified admins of order ${payload.orderId}`);
  }
}
