import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from 'src/carts/carts.service';
import { CartItem } from 'src/orders/orders.service';
import { it, expect, describe, vi, beforeAll } from 'vitest';

describe('CartsService (Unit)', () => {
  let service: CartsService;

  beforeAll(async () => {
    const mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
  });

  describe('Cart item deduplication', () => {
    const incomingCart: CartItem[] = [
      {
        id: '8c9d7f3e',
        name: 'Wireless Mouse',
        price: 25.99,
        quantity: 2,
        image: 'https://example.com/images/mouse.jpg',
      },
      {
        id: 'a571ae4c',
        name: 'Mechanical Keyboard',
        price: 75.5,
        quantity: 1,
        image: 'https://example.com/images/keyboard.jpg',
      },
      {
        id: 'b213fa2e',
        name: 'Laptop Stand',
        price: 34.0,
        quantity: 1,
        image: 'https://example.com/images/stand.jpg',
      },
    ];

    const currentCart: CartItem[] = [
      {
        id: '8c9d7f3e',
        name: 'Wireless Mouse',
        price: 25.99,
        quantity: 1,
        image: 'https://example.com/images/mouse.jpg',
      },
      {
        id: 'f83b8e44',
        name: 'USB-C Hub',
        price: 42.9,
        quantity: 1,
        image: 'https://example.com/images/hub.jpg',
      },
      {
        id: 'b213fa2e',
        name: 'Laptop Stand',
        price: 34.0,
        quantity: 2,
        image: 'https://example.com/images/stand.jpg',
      },
    ];

    it('remove duplicate products from a cart', () => {
      const mergedCart = service.mergeIncomingWithCurrentCart(
        incomingCart,
        currentCart,
      );
      const expectedQuantities = {
        '8c9d7f3e': 3,
        b213fa2e: 3,
        a571ae4c: 1,
        f83b8e44: 1,
      };

      expect(mergedCart).toHaveLength(4);

      Object.entries(expectedQuantities).forEach(([id, quantity]) => {
        const item = mergedCart.find((item) => item.id === id);
        expect(item?.quantity).toBe(quantity);
      });
    });
  });
});
