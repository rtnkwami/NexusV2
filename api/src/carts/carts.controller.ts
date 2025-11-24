import { Controller, Get, Body, Delete, Put } from '@nestjs/common';
import { CartsService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Auth } from 'src/auth/auth.decorator';
import { CurrentUser } from 'src/auth/user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller({
  path: 'carts',
})
@Auth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  getCart(@CurrentUser() user: DecodedIdToken) {
    const cartKey = `cart-${user.sub}`;
    return this.cartsService.getCart(cartKey);
  }

  @Put()
  updateCart(
    @CurrentUser() user: DecodedIdToken,
    @Body() cartData: UpdateCartDto,
  ) {
    const cartKey = `cart-${user.sub}`;
    return this.cartsService.updateCart(cartKey, cartData);
  }

  @Delete()
  clear(@CurrentUser() user: DecodedIdToken) {
    const cartKey = `cart-${user.sub}`;
    return this.cartsService.clearCart(cartKey);
  }
}
