import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { afterEach, it, expect, describe, vi, beforeAll } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import createFakeProduct from 'test/utils/fakeProducts';

describe('ProductService (Unit)', () => {
  let service: ProductsService;

  const mockProductRepository = {
    create: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    findAndCount: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    save: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureSufficientProductStock', () => {
    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.ensureSufficientProductStock('non-existent-uuid', 5),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.ensureSufficientProductStock('non-existent-uuid', 5),
      ).rejects.toThrow('Product does not exist. Cannot be ordered');
    });

    it('should throw BadRequestException if product does not have sufficient stock', async () => {
      const testProduct = createFakeProduct({ stock: 2 });

      mockProductRepository.findOneBy.mockResolvedValue(testProduct);

      await expect(
        service.ensureSufficientProductStock('test-uuid', 5),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.ensureSufficientProductStock('test-uuid', 5),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not throw if product has sufficient stock', async () => {
      const testProduct = createFakeProduct({ stock: 10 });

      mockProductRepository.findOneBy.mockResolvedValue(testProduct);

      await expect(
        service.ensureSufficientProductStock('test-uuid', 5),
      ).resolves.not.toThrow();
    });

    it('should not throw if requested quantity equals available stock', async () => {
      const testProduct = createFakeProduct();

      mockProductRepository.findOneBy.mockResolvedValue(testProduct);

      await expect(
        service.ensureSufficientProductStock('test-uuid', 5),
      ).resolves.not.toThrow();
    });
  });
});
