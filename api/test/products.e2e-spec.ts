import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import request from 'supertest';
import { ProductWithoutOrdersDto } from 'src/products/dto/search-product-response.dto';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { BypassAuthGuard } from './overrides/auth.override';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let datasource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useClass(BypassAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    datasource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (POST)', () => {
    beforeEach(async () => {
      await datasource.query('TRUNCATE TABLE product CASCADE;');
    });

    it('should create a product', async () => {
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

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(testProduct);

      const responseBody = response.body as ProductWithoutOrdersDto;
      expect(response.statusCode).toBe(201);
      expect(responseBody.name).toEqual(testProduct.name);
      expect(responseBody.description).toEqual(testProduct.description);
    });
  });
});
