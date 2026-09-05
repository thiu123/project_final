import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { RedisModule } from './config/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { BooksModule } from './modules/books/books.module';
import { CartsModule } from './modules/carts/carts.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';

const mongoLogger = new Logger('Mongoose');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URL'),
        onConnectionCreate: (connection) => {
          connection.on('connected', () => mongoLogger.log('Connected to MongoDB'));
          connection.on('error', (err) => mongoLogger.error(`Error connecting to MongoDB: ${err}`));
          return connection;
        },
      }),
    }),
    // Global JwtModule: the secret is passed per call (access vs refresh key).
    JwtModule.register({ global: true }),
    RedisModule,
    CloudinaryModule,
    AuthModule,
    UsersModule,
    BooksModule,
    CartsModule,
    ReviewsModule,
    OrdersModule,
    FavoritesModule,
    ChatbotModule,
    ContactsModule,
    VouchersModule,
  ],
})
export class AppModule {}
