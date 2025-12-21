import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from './dto/update-order.dto';
import { CartsService } from 'src/carts/carts.service';
import { ProductsService } from 'src/products/products.service';
import { OrderSearchFilters } from './types/order-search';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

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
    private prisma: PrismaService,
    private productService: ProductsService,
    private cartsService: CartsService,
  ) {}

  async createOrder(userId: string, cartKey: string) {
    const data = await this.cartsService.getCart(cartKey);

    if (!data) {
      throw new BadRequestException(
        'Cart is empty. No products to place an order',
      );
    }
    for (const item of data.cart) {
      await this.productService.ensureSufficientProductStock(
        item.id,
        item.quantity,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const total = data.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      await Promise.all(
        data.cart.map((item) =>
          tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      const order = await tx.order.create({
        data: { userId, total },
      });

      const orderItems = await Promise.all(
        data.cart.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.id,
              quantity: item.quantity,
              priceAtTime: item.price,
            },
          }),
        ),
      );

      await this.cartsService.clearCart(cartKey);

      return { order, orderItems };
    });
  }

  async searchOrders(
    filters?: OrderSearchFilters,
    userId?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      userId: userId,

      status: filters?.status,

      createdAt: filters?.dateRange && {
        gte: filters.dateRange.from,
        lte: filters.dateRange.to,
      },
    };

    const [orders, totalOrders] = await Promise.all([
      this.prisma.order.findMany({ where, skip, take: limit }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      page,
      perPage: limit,
      count: orders.length,
      total: totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    };
  }

  async getOrder(uuid: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      relationLoadStrategy: 'join',
      where: { id: uuid },
      include: {
        OrderItem: {
          select: {
            quantity: true,
            priceAtTime: true,
            Product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    const orderDto = {
      id: order.id,
      status: order.status,
      userId: order.userId,
      total: order.total.toNumber(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.OrderItem.map((item) => ({
        id: item.Product.id,
        name: item.Product.name,
        images: item.Product.images,
        quantity: item.quantity,
        price: item.priceAtTime.toNumber(),
      })),
    };

    return orderDto;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }
}
