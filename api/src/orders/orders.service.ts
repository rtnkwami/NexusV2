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
import { Product } from 'src/products/entities/product.entity';
import { OrderSearchFilters } from './types/order-search';
import { OrderProduct } from './entities/order-product.entity';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private productService: ProductsService,
    private cartsService: CartsService,
    private dataSource: DataSource,
  ) {}

  async orderTransaction(cart: CartItem[]) {
    const order = await this.dataSource.transaction(async (manager) => {
      const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const newOrder = manager.create(Order, {
        total,
      });
      await manager.save(newOrder);

      await Promise.all(
        cart.map(async (item) => {
          await manager.decrement(
            Product,
            { id: item.id },
            'stock',
            item.quantity,
          );

          const orderProduct = manager.create(OrderProduct, {
            quantity: item.quantity,
            priceAtTime: item.price,
            product: { id: item.id },
            order: newOrder,
            createdAt: newOrder.createdAt,
          });

          return manager.save(orderProduct);
        }),
      );
      return newOrder;
    });
    return order;
  }

  async placeOrder(cartKey: string) {
    const data = await this.cartsService.getCart(cartKey);

    if (!data) {
      throw new NotFoundException(
        'Cart is empty. No products to place an order',
      );
    }
    for (const item of data.cart) {
      await this.productService.ensureSufficientProductStock(
        item.id,
        item.quantity,
      );
    }
    const newOrder = await this.orderTransaction(data.cart);
    return newOrder;
  }

  async searchOrders(
    filters?: OrderSearchFilters,
    page?: number,
    limit?: number,
  ) {
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
      orders,
      page: currentPage,
      perPage: take,
      count: orders.length,
      total: totalOrders,
      totalPages: Math.ceil(totalOrders / take),
    };
  }

  getOrder(uuid: string) {
    return this.orderRepository.findOne({
      where: { id: uuid },
      relations: ['products'],
    });
  }

  async updateOrderStatus(uuid: string, newStatus: OrderStatus) {
    await this.orderRepository.update({ id: uuid }, { status: newStatus });
    return this.orderRepository.findOneBy({ id: uuid });
  }
}
