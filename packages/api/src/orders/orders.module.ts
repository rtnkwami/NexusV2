import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { CartsModule } from 'src/carts/carts.module';
import { ProductsModule } from 'src/products/products.module';
import { OrderProduct } from './entities/order-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderProduct]),
    ProductsModule,
    CartsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
