import { it, expect, describe, beforeAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../products.service';
import { PrismaService } from 'src/prisma.service';
import createFakeProduct from 'test/utils/fakeProducts';
import { prisma } from 'test/setup/setup.integration';

describe('ProductService (Integration)', () => {
  let service: ProductsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('basic CRUD operations', () => {
    it('should create a product', async () => {
      const testProduct = createFakeProduct();
      const product = await service.createProduct(testProduct);

      expect(product).not.toBeNull();
      expect(product.name).toBe(testProduct.name);
    });

    it('should get a product by id', async () => {
      const testProduct = createFakeProduct();
      const product = await service.createProduct(testProduct);
      const createdProduct = await service.getProduct(product.id);

      expect(createdProduct).toBeDefined();
      expect(createdProduct.name).toEqual(product.name);
    });

    it('should update a product', async () => {
      const testProduct = createFakeProduct();
      const product = await service.createProduct(testProduct);
      const updatedProduct = await service.updateProduct(product.id, {
        category: 'Test Category',
      });

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct.category).toBe('Test Category');
    });

    it('should delete a product', async () => {
      const testProduct = createFakeProduct();
      const product = await service.createProduct(testProduct);
      const deletedProduct = await service.removeProduct(product.id);

      expect(deletedProduct.id).toBe(product.id);
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
        results.products.every((p) => p.name.toLowerCase().includes('e')),
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
      const results = await service.searchProducts({
        price: { min: 500, max: 1000 },
      });
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
      const results = await service.searchProducts({
        stock: { min: 50, max: 150 },
      });
      expect(results.total).not.toBe(0);
    });

    it('should filter by category', async () => {
      const results = await service.searchProducts({ category: 'Electronics' });
      expect(results.total).not.toBe(0);
    });
  });
});
