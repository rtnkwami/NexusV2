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
        {
          provide: ProductsService,
          useValue: vi.fn(),
        },
        {
          provide: CartsService,
          useValue: vi.fn(),
        },
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
      console.log(orders[0].products);
      expect(orders[0].products).not.toHaveLength(0);
    });
  });
});
