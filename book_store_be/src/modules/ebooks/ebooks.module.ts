import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from '../books/schemas/book.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { EbooksController } from './ebooks.controller';
import { EbooksService } from './ebooks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [EbooksController],
  providers: [EbooksService],
  exports: [EbooksService],
})
export class EbooksModule {}
