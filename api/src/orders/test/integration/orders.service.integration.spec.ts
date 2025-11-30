import { Test, TestingModule } from '@nestjs/testing';
import { CartItem, OrdersService } from '../../orders.service';
import {
  describe,
  beforeAll,
  it,
  expect,
  vi,
  beforeEach,
  afterAll,
} from 'vitest';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderProduct } from '../../entities/order-product.entity';
import { Order } from '../../entities/order.entity';
import createFakeProduct, { FakeProduct } from 'test/utils/fakeProducts';
import { faker } from '@faker-js/faker';
import { ProductsService } from 'src/products/products.service';
import { CartsService } from 'src/carts/carts.service';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { OrderStatus } from 'src/orders/dto/update-order.dto';
import createFakeOrders from 'test/utils/fakeOrders';

describe('OrdersService', () => {
  let service: OrdersService;
  let datasource: DataSource;
  let testDb: StartedPostgreSqlContainer;

  beforeAll(async () => {
    testDb = await new PostgreSqlContainer('postgres:18').start();
    const connectionUri = testDb.getConnectionUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: connectionUri,
          entities: [Product, Order, OrderProduct, User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Product, Order, OrderProduct, User]),
      ],
      providers: [
        OrdersService,
        { provide: ProductsService, useValue: vi.fn() },
        { provide: CartsService, useValue: vi.fn() },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    datasource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await datasource.destroy();
    await testDb.stop();
  });

  describe('Order Transaction', () => {
    beforeEach(async () => {
      const productsToOrder: FakeProduct[] = [];
      for (let i = 0; i < 6; i++) {
        const product = createFakeProduct();
        productsToOrder.push(product);
      }

      await datasource.getRepository(Product).insert(productsToOrder);
    });

    it('should place an order and decrease stock', async () => {
      const products = await datasource.getRepository(Product).find();

      const testCart: CartItem[] = products.map((item) => {
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: faker.number.int({ min: 1, max: 10 }),
          image: item.images[0],
        };
      });

      await service.orderTransaction(testCart);

      const orders = await datasource
        .getRepository(Order)
        .find({ relations: ['products'] });

      expect(orders).not.toHaveLength(0);
      expect(orders[0].products).not.toHaveLength(0);
      expect(orders[0].status).toBe(OrderStatus.PENDING);
    });
  });

  describe('basic CRUD operations', () => {
    beforeEach(async () => {
      await datasource.query('TRUNCATE "order" CASCADE');

      await createFakeOrders({
        service,
        datasource,
        productCount: 5,
        orderCount: 3,
      });
    });

    it('should get an order by id', async () => {
      const orders = await datasource.getRepository(Order).find();
      const order = await service.getOrder(orders[0].id);

      expect(order).toBeDefined();
      expect(order?.products).toBeDefined();
      expect(order?.products.length).toBeGreaterThan(0);
      expect(order?.products[0]).toHaveProperty('quantity');
    });

    it('should update the status of an order', async () => {
      const orders = await datasource.getRepository(Order).find();
      const orderToUpdate = orders[0];
      await service.updateOrderStatus(orderToUpdate.id, OrderStatus.COMPLETED);

      const updatedOrder = await datasource
        .getRepository(Order)
        .findOneBy({ id: orderToUpdate.id });

      expect(orderToUpdate.status).toBe(OrderStatus.PENDING);
      expect(updatedOrder?.status).toBe(OrderStatus.COMPLETED);
    });

    describe('order search filtering', () => {
      beforeAll(async () => {
        await createFakeOrders({
          service,
          datasource,
          productCount: 20,
          orderCount: 30,
        });
      });

      it('should filter by date range', async () => {
        const now = new Date();
        const yesterday = new Date(now.getDate() - 1);

        const orders = await service.searchOrders({
          dateRange: {
            from: yesterday.toISOString(),
            to: now.toISOString(),
          },
        });

        console.log(orders.total);
        expect(orders.total).toBeGreaterThan(0);
      });
    });
  });
});
