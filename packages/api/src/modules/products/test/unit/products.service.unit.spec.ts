import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { ProductsService } from 'src/modules/products/products.service';
import { PrismaService } from 'src/prisma.service';
import createFakeProduct from 'test/utils/fakeProducts';
import { randomUUID } from 'crypto';

describe('ProductsService (Unit)', () => {
  let service: ProductsService;

  const prismaMock = {
    product: {
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureSufficientProductStock', () => {
    it('throws NotFoundException if product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(
        service.ensureSufficientProductStock('non-existent-id', 5),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('throws BadRequestException if stock is insufficient', async () => {
      const product = {
        id: randomUUID(),
        ...createFakeProduct({ stock: 2 }),
      };

      prismaMock.product.findUnique.mockResolvedValue(product);

      await expect(
        service.ensureSufficientProductStock(product.id, 5),
      ).rejects.toThrow(BadRequestException);
    });

    it('does not throw if stock is sufficient', async () => {
      const product = {
        id: randomUUID(),
        ...createFakeProduct({ stock: 10 }),
      };

      prismaMock.product.findUnique.mockResolvedValue(product);

      await expect(
        service.ensureSufficientProductStock(product.id, 5),
      ).resolves.not.toThrow();
    });

    it('does not throw if requested quantity equals stock', async () => {
      const product = {
        id: randomUUID(),
        ...createFakeProduct({ stock: 5 }),
      };

      prismaMock.product.findUnique.mockResolvedValue(product);

      await expect(
        service.ensureSufficientProductStock(product.id, 5),
      ).resolves.not.toThrow();
    });
  });
});
