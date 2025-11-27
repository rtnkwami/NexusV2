import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import {
  ProductSearchResponseDto,
  ProductWithoutOrdersDto,
} from 'src/products/dto/search-product-response.dto';
import { DataSource } from 'typeorm';
import createTestApp from './utils/setup';
import { beforeEach, afterAll, it, expect, describe, beforeAll } from 'vitest';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let datasource: DataSource;

  const testProduct = {
    name: 'Premium Yoga Mat',
    description:
      'Extra thick 6mm non-slip yoga mat with alignment marks and carrying strap.',
    category: 'Fitness',
    price: 39.99,
    stock: 120,
    images: [
      'https://example.com/images/yoga-mat-purple.jpg',
      'https://example.com/images/yoga-mat-rolled.jpg',
    ],
  };

  beforeAll(async () => {
    ({ app, datasource } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (POST)', () => {
    beforeEach(async () => {
      await datasource.query('TRUNCATE TABLE product CASCADE;');
    });

    it('should create a product', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .send(testProduct);

      const responseBody = response.body as ProductWithoutOrdersDto;
      expect(response.statusCode).toBe(201);
      expect(responseBody.name).toEqual(testProduct.name);
      expect(responseBody.description).toEqual(testProduct.description);
    });

    it('should throw a bad request error on missing product fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Super Glue',
          price: 3,
        });

      expect(response.statusCode).toBe(400);
    });

    describe('/products (GET)', () => {
      beforeEach(async () => {
        await request(app.getHttpServer()).post('/products').send(testProduct);
      });

      it('should get a list of products', async () => {
        const response = await request(app.getHttpServer()).get('/products');
        expect(response.statusCode).toBe(200);

        const results = response.body as ProductSearchResponseDto;
        expect(results.products).not.toHaveLength(0);
        expect(results.products[0].name).toEqual(testProduct.name);
      });

      it('should throw a bad request error on invalid search params', async () => {
        const response = await request(app.getHttpServer())
          .get('/products')
          .query({ price: -5, minPrice: -10 });

        expect(response.statusCode).toBe(400);
      });
    });
  });

  // describe('/products (GET)', () => {
  //   beforeAll(async () => {

  //   })

  //   it('should return a paginated list of products', () => {

  //   })
  // })
});
