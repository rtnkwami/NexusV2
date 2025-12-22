import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './modules/products/products.module';
import Joi from 'joi';
import { UsersModule } from './modules/users/users.module';
import { CartsModule } from './modules/carts/carts.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { OrdersModule } from './modules/orders/orders.module';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        FIREBASE_PROJECT_ID: Joi.string().required(),
        FIREBASE_PRIVATE_KEY: Joi.string().required(),
        FIREBASE_CLIENT_EMAIL: Joi.string().required(),
        REDIS_URL: Joi.string().uri(),
      }),
      validationOptions: {
        abortEarly: true,
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [new KeyvRedis(process.env.REDIS_URL)],
        };
      },
    }),
    LoggerModule.forRoot(),
    ProductsModule,
    UsersModule,
    CartsModule,
    OrdersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
