import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { CartsService } from 'src/carts/carts.service';
import { ProductsService } from 'src/products/products.service';
import { OrderProduct } from './entities/order-product.entity';
import { Product } from 'src/products/entities/product.entity';
import { OrderSearchFilters } from './types/order-search';

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

  async search(filters?: OrderSearchFilters, page?: number, limit?: number) {
    const take = limit ?? 20;
    const currentPage = page ?? 1;
    const skip = ((currentPage ?? 1) - 1) * take;

    const whereClause: FindOptionsWhere<Order> = {};

    if (filters?.customer) {
      whereClause.user = {
        name: ILike(`%${filters.customer}%`),
      };
    }

    if (filters?.dateRange) {
      whereClause.createdAt = Between(
        filters.dateRange.from,
        filters.dateRange.to,
      );
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    const [orders, totalOrders] = await this.orderRepository.findAndCount({
      where: whereClause,
      skip,
      take,
    });

    return {
      data: orders,
      page: currentPage,
      perPage: take,
      count: orders.length,
      total: totalOrders,
      totalPages: Math.ceil(totalOrders / take),
    };
  }

  findOne(uuid: string) {
    return this.orderRepository.findOneBy({ id: uuid });
  }

  updateStatus(uuid: string, newStatus: OrderStatus) {
    return this.orderRepository.update({ id: uuid }, { status: newStatus });
  }

  remove(uuid: string) {
    return `This action removes a order`;
  }
}
