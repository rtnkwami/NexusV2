import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import request from 'supertest';
import {
  ProductSearchResponseDto,
  ProductWithoutOrdersDto,
} from 'src/products/dto/search-product-response.dto';
import { beforeEach, afterAll, it, expect, describe, beforeAll } from 'vitest';
import createFakeProduct from './utils/fakeProducts';
import { prisma } from './setup/setup.e2e';
import { AppModule } from 'src/app.module';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { BypassAuthGuard } from './utils/auth.override';
import { PrismaService } from 'src/prisma.service';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
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

  describe('/products (POST)', () => {
    beforeEach(async () => {
      await prisma.product.deleteMany();
    });

    it('should create a product', async () => {
      const product = createFakeProduct();

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(product);

      const responseBody = response.body as ProductWithoutOrdersDto;
      expect(response.statusCode).toBe(201);
      expect(responseBody.name).toEqual(product.name);
      expect(responseBody.description).toEqual(product.description);
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
      let product: ReturnType<typeof createFakeProduct>;
      beforeEach(async () => {
        product = createFakeProduct();
        await request(app.getHttpServer()).post('/products').send(product);
      });

      it('should get a list of products', async () => {
        const response = await request(app.getHttpServer()).get('/products');
        expect(response.statusCode).toBe(200);

        const results = response.body as ProductSearchResponseDto;
        expect(results.products).not.toHaveLength(0);
        expect(results.products[0].name).toEqual(product.name);
      });

      it('should throw a bad request error on invalid search params', async () => {
        const response = await request(app.getHttpServer())
          .get('/products')
          .query({ price: -5, minPrice: -10 });

        expect(response.statusCode).toBe(400);
      });
    });
  });
});
