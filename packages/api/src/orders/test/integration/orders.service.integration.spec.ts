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
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

describe('OrdersService', () => {
  let service: OrdersService;
  let cartService: CartsService;
  let datasource: DataSource;
  let testDb: StartedPostgreSqlContainer;
  let testRedis: StartedRedisContainer;

  beforeAll(async () => {
    testDb = await new PostgreSqlContainer('postgres:18').start();
    testRedis = await new RedisContainer('redis:8').start();
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
        CacheModule.registerAsync({
          useFactory: () => {
            return {
              stores: [new KeyvRedis(testRedis.getConnectionUrl())],
            };
          },
        }),
      ],
      providers: [
        OrdersService,
        CartsService,
        { provide: ProductsService, useValue: vi.fn() },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    datasource = module.get<DataSource>(DataSource);
    cartService = module.get<CartsService>(CartsService);
  });

  afterAll(async () => {
    await datasource.destroy();
    await testDb.stop();
  });

  describe('Order Transaction', () => {
    const testCartKey = 'test-cart';
    const testCartData: { cart: CartItem[] } = {
      cart: [],
    };

    beforeAll(async () => {
      const productsToOrder: FakeProduct[] = [];
      for (let i = 0; i < 3; i++) {
        const product = createFakeProduct();
        productsToOrder.push(product);
      }

      await datasource.getRepository(Product).insert(productsToOrder);
      const testUser = datasource.getRepository(User).create({
        id: 'test-user-id',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        avatar: 'https://johnspics.com/air.png',
      });
      await datasource.getRepository(User).save(testUser);

      const products = await datasource.getRepository(Product).find();

      products.forEach((item) => {
        const cartItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: faker.number.int({ min: 1, max: 10 }),
          image: item.images[0],
        };
        testCartData.cart.push(cartItem);
      });
      await cartService.updateCart(testCartKey, testCartData);
    });

    it('should place an order, decrease stock, and clear cart', async () => {
      const cartBeforeOrder = await cartService.getCart(testCartKey);
      expect(cartBeforeOrder).toBeDefined();
      expect(cartBeforeOrder?.cart.length).toBeGreaterThan(0);

      const users = await datasource.getRepository(User).find();
      const testUser = users[0];
      await service.orderTransaction(
        testCartData.cart,
        testUser.id,
        testCartKey,
      );
      const cartAfterOrder = await cartService.getCart(testCartKey);

      const orders = await datasource
        .getRepository(Order)
        .find({ relations: ['products', 'user'] });

      expect(orders).not.toHaveLength(0);
      expect(orders[0].user).toBeDefined();
      expect(orders[0].products).not.toHaveLength(0);
      expect(cartAfterOrder).not.toBeDefined();
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

    it("should get a specfic user's orders", async () => {
      const users = await datasource.getRepository(User).find();
      const testUser = users[0];
      const userOrders = await service.searchOrders({}, testUser.id);

      expect(userOrders.total).toBeGreaterThan(0);
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

    it('should filter orders by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const data = await service.searchOrders({
        dateRange: {
          from: yesterday.toISOString(),
          to: now.toISOString(),
        },
      });

      expect(data.total).toBeGreaterThan(0);
    });

    it('should filter orders by status', async () => {
      const data = await service.searchOrders();
      for (let i = 0; i < data.orders.length; i++) {
        const order = data.orders[i];
        await datasource
          .getRepository(Order)
          .update({ id: order.id }, { status: 'completed' });
        i++;
      }

      const newData = await service.searchOrders({
        status: OrderStatus.COMPLETED,
      });
      expect(newData.total).toBeGreaterThan(0);
    });
  });
});
