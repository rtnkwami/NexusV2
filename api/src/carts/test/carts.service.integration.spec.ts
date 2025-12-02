import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeAll, it, expect, describe, afterAll } from 'vitest';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { CartsService } from '../carts.service';
import createFakeProduct from 'test/utils/fakeProducts';
import { randomUUID } from 'crypto';
import { CartItem } from 'src/orders/orders.service';
import { faker } from '@faker-js/faker';

describe('CartService (Integration)', () => {
  let testRedis: StartedRedisContainer;
  let service: CartsService;
  let module: TestingModule;

  beforeAll(async () => {
    testRedis = await new RedisContainer('redis:8.4.0').start();

    module = await Test.createTestingModule({
      imports: [
        CacheModule.registerAsync({
          useFactory: () => {
            return {
              stores: [new KeyvRedis(testRedis.getConnectionUrl())],
            };
          },
        }),
      ],
      providers: [CartsService],
    }).compile();

    service = module.get<CartsService>(CartsService);
  });

  afterAll(async () => {
    await module.close();
    await testRedis.stop();
  });

  describe('basic CRUD operations', () => {
    it('should put items in a cart', async () => {
      const data: { cart: CartItem[] } = {
        cart: [],
      };
      const baseProduct = createFakeProduct();

      const cartItem: CartItem = {
        id: randomUUID(),
        name: baseProduct.name,
        price: baseProduct.price,
        quantity: faker.number.float({ fractionDigits: 2 }),
        image: baseProduct.images[0],
      };

      data.cart.push(cartItem);
      const cartData = await service.updateCart('test-key', data);

      expect(cartData?.cart).toHaveLength(1);
      expect(cartData?.cart[0]).toHaveProperty('name');
      expect(cartData?.cart[0].name).toBe(baseProduct.name);
    });
  });
});
