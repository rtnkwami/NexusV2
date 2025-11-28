import { it, expect, describe, beforeAll, beforeEach, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'src/data-source';
import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderProduct } from 'src/orders/entities/order-product.entity';
import { User } from 'src/users/entities/user.entity';
import createFakeProduct from 'test/utils/fakeProducts';

describe('ProductService', () => {
  let service: ProductsService;
  let datasource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...AppDataSource.options,
          entities: [Product, Order, OrderProduct, User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Product, Order, OrderProduct, User]),
      ],
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    datasource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await datasource.destroy();
  });

  describe('basic CRUD operations', () => {
    beforeEach(async () => {
      await datasource.query('TRUNCATE product CASCADE')
    })

    it('should create a product', async () => {
      const testProduct = createFakeProduct();
      const product = await service.createProduct(testProduct);

      expect(product).not.toBeNull();
      expect(product.name).toBe(testProduct.name);
    });
  
    it('should get a product by id', async () => {
      const testProduct = createFakeProduct();

      const product = await service.createProduct(testProduct);
      const newProduct = await service.getProduct(product.id);
  
      expect(newProduct.id).toBe(product.id);
    });
  });


  describe('product search filtering', () => {
    beforeAll(async () => {
      for (let i = 0; i < 60; i++) {
        const product = createFakeProduct();
        await service.createProduct(product);
      }
    });

    it('should filter by search query', async () => {
      const results = await service.searchProducts({ searchQuery: 'e' });
      expect(results.count).not.toBe(0);
      expect(
        results.products.every(
          (p) => p.name.toLowerCase().includes('e')
        )
      ).toBe(true);
    });

    it('should filter by minimum price', async () => {
      const results = await service.searchProducts({ price: { min: 200 } });
      expect(results.count).not.toBe(0);
    });

    it('should filter by maximum price', async () => {
      const results = await service.searchProducts({ price: { max: 500 } });
      expect(results.total).not.toBe(0);
    });

    it('should filter by price range', async () => {
      const results = await service.searchProducts({ price: { min: 500, max: 1000 } });
      expect(results.total).not.toBe(0);
    });

    it('should filter by minimum stock', async () => {
      const results = await service.searchProducts({ stock: { min: 50 } });
      expect(results.total).not.toBe(0);
    });

    it('should filter by maximum stock', async () => {
      const results = await service.searchProducts({ stock: { max: 70 } });
      expect(results.total).not.toBe(0);
    });

    it('should filter by stock range', async () => {
      const results = await service.searchProducts({ stock: { min: 50, max: 150 } });
      expect(results.total).not.toBe(0);
    });
  })
});
