import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { CartsService } from 'src/carts/carts.service';
import { ProductsService } from 'src/products/products.service';
import { OrderProduct } from './entities/order-product.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private productService: ProductsService,
    private cartsService: CartsService,
    private dataSource: DataSource,
  ) {}

  async create(cartKey: string) {
    const data = await this.cartsService.getCart(cartKey);

    if (!data) {
      throw new NotFoundException(
        'Cart is empty. No products to place an order',
      );
    }

    for (const item of data.cart) {
      await this.productService.ensureSufficientStock(item.id, item.quantity);
    }

    const newOrder = await this.dataSource.transaction(async (manager) => {
      const total = data.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const order = manager.create(Order, {
        total,
      });
      await manager.save(order);

      for (const item of data.cart) {
        const orderProduct = manager.create(OrderProduct, {
          product: { id: item.id },
          quantity: item.quantity,
          priceAtTime: item.price,
          order: { id: order.id },
        });
        await manager.save(orderProduct);
        //
        await manager.decrement(
          Product,
          { id: item.id },
          'stock',
          item.quantity,
        );
      }
      return order;
    });
    return newOrder;
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
