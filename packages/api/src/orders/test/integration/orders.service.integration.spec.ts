import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { CacheModule } from '@nestjs/cache-manager';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';

import { OrdersService } from 'src/orders/orders.service';
import { CartsService } from 'src/carts/carts.service';
import { ProductsService } from 'src/products/products.service';
import { PrismaService } from 'src/prisma.service';
import { OrderStatus } from 'src/orders/dto/update-order.dto';

import { prisma } from 'test/setup/setup.integration';
import createFakeProduct from 'test/utils/fakeProducts';

describe('OrdersService', () => {
  let service: OrdersService;
  let cartsService: CartsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [OrdersService, CartsService, ProductsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get(OrdersService);
    cartsService = module.get(CartsService);
  });

  beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('createOrder', () => {
    it('should throw if cart does not exist', async () => {
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: 'Test User',
          email: faker.internet.email(),
        },
      });

      await expect(
        service.createOrder(user.id, 'missing-cart'),
      ).rejects.toThrow('Cart is empty');
    });

    it('should throw if product stock is insufficient', async () => {
      const product = await prisma.product.create({
        data: createFakeProduct({ stock: 1 }),
      });

      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: 'Test User',
          email: faker.internet.email(),
        },
      });

      const cartKey = 'low-stock-cart';
      await cartsService.updateCart(cartKey, {
        cart: [
          {
            id: product.id,
            name: product.name,
            price: product.price.toNumber(),
            quantity: 5,
            image: product.images[0],
          },
        ],
      });

      await expect(service.createOrder(user.id, cartKey)).rejects.toThrow();
    });

    it('should create order, items, decrements stock, and clears cart', async () => {
      const products = await Promise.all(
        Array.from({ length: 3 }).map(() =>
          prisma.product.create({
            data: createFakeProduct({ stock: 20 }),
          }),
        ),
      );

      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: 'Buyer',
          email: faker.internet.email(),
        },
      });

      const cartKey = 'valid-cart';
      await cartsService.updateCart(cartKey, {
        cart: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price.toNumber(),
          quantity: 2,
          image: p.images[0],
        })),
      });

      const result = await service.createOrder(user.id, cartKey);

      expect(result.order).toBeDefined();
      expect(result.orderItems).toHaveLength(products.length);

      const dbOrder = await prisma.order.findUnique({
        where: { id: result.order.id },
        include: { OrderItem: true },
      });

      expect(dbOrder?.OrderItem.length).toBe(products.length);

      const updatedProducts = await prisma.product.findMany();
      updatedProducts.forEach((p) => {
        expect(p.stock).toBe(18);
      });

      const cartAfter = await cartsService.getCart(cartKey);
      expect(cartAfter).toBeUndefined();
    });
  });

  describe('getOrder', () => {
    it('should throw if order does not exist', async () => {
      await expect(service.getOrder(randomUUID())).rejects.toThrow();
    });

    it('should return mapped DTO with items', async () => {
      const product = await prisma.product.create({
        data: createFakeProduct(),
      });

      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: 'User',
          email: faker.internet.email(),
        },
      });

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          total: product.price,
          OrderItem: {
            create: {
              productId: product.id,
              quantity: 1,
              priceAtTime: product.price,
            },
          },
        },
      });

      const dto = await service.getOrder(order.id);

      expect(dto.id).toBe(order.id);
      expect(dto.items).toHaveLength(1);
      expect(dto.items[0]).toMatchObject({
        id: product.id,
        name: product.name,
        quantity: 1,
      });
    });
  });

  describe('searchOrders', () => {
    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: 'Searcher',
          email: faker.internet.email(),
        },
      });

      for (let i = 0; i < 10; i++) {
        await prisma.order.create({
          data: {
            userId: user.id,
            total: faker.number.int({ min: 10, max: 200 }),
            status: i % 2 === 0 ? OrderStatus.COMPLETED : OrderStatus.PENDING,
            createdAt: faker.date.recent({ days: 3 }),
          },
        });
      }
    });

    it('should paginate results', async () => {
      const res = await service.searchOrders({}, undefined, 1, 5);

      expect(res.orders).toHaveLength(5);
      expect(res.totalPages).toBeGreaterThan(1);
    });

    it('should filter by status', async () => {
      const res = await service.searchOrders({
        status: OrderStatus.COMPLETED,
      });

      res.orders.forEach((o) => expect(o.status).toBe(OrderStatus.COMPLETED));
    });

    it('should filter by date range', async () => {
      const from = new Date();
      from.setDate(from.getDate() - 2);

      const res = await service.searchOrders({
        dateRange: {
          from: from.toISOString(),
          to: new Date().toISOString(),
        },
      });

      expect(res.total).toBeGreaterThan(0);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update only the order status', async () => {
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: 'Updater',
          email: faker.internet.email(),
        },
      });

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          total: 100,
        },
      });

      const res = await service.updateOrderStatus(
        order.id,
        OrderStatus.COMPLETED,
      );

      expect(res).toEqual({
        id: order.id,
        status: OrderStatus.COMPLETED,
      });
    });
  });
});
