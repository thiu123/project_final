import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksModule } from '../books/books.module';
import { CartsModule } from '../carts/carts.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MomoService } from './payments/momo.service';
import { VnpayService } from './payments/vnpay.service';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CartsModule,
    BooksModule,
    VouchersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, VnpayService, MomoService],
})
export class OrdersModule {}
