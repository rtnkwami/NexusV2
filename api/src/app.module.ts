import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import Joi from 'joi';
import { AppDataSource } from './data-source';
import { UsersModule } from './users/users.module';
import { CartsModule } from './carts/carts.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_PORT: Joi.number().port().required(),
        DATABASE_HOST: Joi.string().required(),
        FIREBASE_PROJECT_ID: Joi.string().required(),
        FIREBASE_PRIVATE_KEY: Joi.string().required(),
        FIREBASE_CLIENT_EMAIL: Joi.string().required(),
        REDIS_URL: Joi.string().uri(),
        API_HOSTED_URL: Joi.string().uri(),
      }),
      validationOptions: {
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [new KeyvRedis(process.env.REDIS_URL)],
        };
      },
    }),
    ProductsModule,
    UsersModule,
    CartsModule,
    OrdersModule,
  ],
})
export class AppModule {}
