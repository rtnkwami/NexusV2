import { afterAll, beforeAll, it, expect, describe } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import createFakeProduct, { FakeProduct } from './utils/fakeProducts';
import request from 'supertest';
import { ProductSearchResponseDto } from 'src/products/dto/search-product-response.dto';
import { CartItem } from 'src/orders/orders.service';
import { faker } from '@faker-js/faker';
import { PlaceOrderResponseDto } from 'src/orders/dto/place-order-response.dto';
import { prisma, dbClient, testRedis } from './setup/setup.e2e';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma.service';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { BypassAuthGuard } from './utils/auth.override';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.REDIS_URL = testRedis.getConnectionUrl();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useClass(BypassAuthGuard)
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Placing an Order', () => {
    beforeAll(async () => {
      await dbClient.query('TRUNCATE TABLE "Product" CASCADE');
      await dbClient.query('TRUNCATE TABLE "Order" CASCADE');

      const productsToOrder: FakeProduct[] = [];
      for (let i = 0; i < 10; i++) {
        const product = createFakeProduct({ stock: 25 });
        productsToOrder.push(product);
      }

      await prisma.product.createMany({
        data: productsToOrder,
      });

      await prisma.user.create({
        data: {
          id: 'test-user-id',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          avatar: 'https://johnspics.com/air.png',
        },
      });
    });

    it('should place and return an order', async () => {
      const apiRequest = request(app.getHttpServer());

      const productSearch = await apiRequest.get('/products');
      const results = productSearch.body as ProductSearchResponseDto;
      const products = results.products;

      const cart: CartItem[] = products.map((item) => {
        return {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: faker.number.int({ min: 1, max: 5 }),
          image: item.images[0],
        };
      });
      const cartData = { cart };

      const response = await apiRequest.put('/carts/me').send(cartData);
      expect(response.statusCode).toBe(200);

      const orderResponse = await apiRequest.post('/orders/me');
      console.log(orderResponse.error);
      expect(orderResponse.statusCode).toBe(201);

      const result = orderResponse.body as PlaceOrderResponseDto;
      expect(result.id).toBeDefined();
    }, 100000);
  });
});
