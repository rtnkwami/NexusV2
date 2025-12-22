import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartsModule } from 'src/modules/carts/carts.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [ProductsModule, CartsModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}
