import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartItem } from 'src/orders/orders.service';

@Injectable()
export class CartsService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getCart(cartKey: string): Promise<UpdateCartDto | undefined> {
    return await this.cacheManager.get<UpdateCartDto>(cartKey);
  }

  async updateCart(
    cartKey: string,
    data: UpdateCartDto,
  ): Promise<UpdateCartDto | undefined> {
    const cacheResponse = await this.cacheManager.get<UpdateCartDto>(cartKey);
    const currentCart = cacheResponse?.cart;

    if (!currentCart) {
      return this.cacheManager.set<UpdateCartDto>(cartKey, data);
    }

    const incomingCart = data.cart;

    const cart = this.mergeIncomingWithCurrentCart(incomingCart, currentCart);
    return { cart };
  }

  mergeIncomingWithCurrentCart(
    incomingCart: CartItem[],
    currentCart: CartItem[],
  ) {
    const cart = new Map(currentCart.map((item) => [item.id, item]));

    incomingCart.forEach((item) => {
      if (cart.has(item.id)) {
        const existingItem = cart.get(item.id)!;
        cart.set(item.id, {
          ...existingItem,
          quantity: existingItem.quantity + item.quantity,
        });
      } else {
        cart.set(item.id, item);
      }
    });
    return Array.from(cart.values());
  }

  async clearCart(cartKey: string) {
    return await this.cacheManager.del(cartKey);
  }
}
