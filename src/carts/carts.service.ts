import { Inject, Injectable } from '@nestjs/common';
// import { UpdateCartDto } from './dto/update-cart.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getCart(cartKey: string): Promise<UpdateCartDto | undefined> {
    return await this.cacheManager.get<UpdateCartDto>(cartKey);
  }

  updateCart(
    cartKey: string,
    data: UpdateCartDto,
  ): Promise<UpdateCartDto | undefined> {
    return this.cacheManager.set<UpdateCartDto>(cartKey, data);
  }

  async clearCart(cartKey: string) {
    return await this.cacheManager.del(cartKey);
  }
}
