import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartsService } from 'src/carts/carts.service';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsService } from 'src/products/products.service';
import { DataSource } from 'typeorm';
import { describe, beforeAll, afterEach, it, vi, expect } from 'vitest';

describe('OrdersService (Unit)', () => {
  let service: OrdersService;
  let cartService: CartsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ProductsService, useValue: vi.fn() },
        { provide: CartsService, useValue: { getCart: vi.fn() } },
        { provide: getRepositoryToken(Order), useValue: vi.fn() },
        { provide: DataSource, useValue: vi.fn() },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    cartService = module.get<CartsService>(CartsService);
  });

  describe('Order Placement', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should throw an error if cart is empty', async () => {
      vi.spyOn(cartService, 'getCart').mockResolvedValue(undefined);

      await expect(
        service.placeOrder('test-cart-key', 'test-user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
