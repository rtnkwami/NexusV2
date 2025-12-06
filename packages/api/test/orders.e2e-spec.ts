import { afterAll, beforeAll, it, expect, describe } from 'vitest';
import createTestApp from './utils/setup';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import createFakeProduct, { FakeProduct } from './utils/fakeProducts';
import request from 'supertest';
import { ProductSearchResponseDto } from 'src/products/dto/search-product-response.dto';
import { CartItem } from 'src/orders/orders.service';
import { faker } from '@faker-js/faker';
import { PlaceOrderResponseDto } from 'src/orders/dto/place-order-response.dto';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let datasource: DataSource;

  beforeAll(async () => {
    ({ app, datasource } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Placing an Order', () => {
    beforeAll(async () => {
      await datasource.query('TRUNCATE TABLE product CASCADE');
      await datasource.query('TRUNCATE "order" CASCADE');

      const productsToOrder: FakeProduct[] = [];
      for (let i = 0; i < 10; i++) {
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
    });

    it('should place an order and return the order id', async () => {
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
      expect(orderResponse.statusCode).toBe(201);

      const result = orderResponse.body as PlaceOrderResponseDto;
      expect(result.orderId).toBeDefined();
    });
  });
});
