import { Controller, Get, Body, Delete, Put } from '@nestjs/common';
import { CartsService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Auth } from 'src/auth/auth.decorator';
import { CurrentUser } from 'src/auth/user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller({
  path: 'carts',
})
@ApiBearerAuth()
@Auth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiOperation({
    summary: 'Get your cart',
    description: 'Get the items in your cart',
  })
  @ApiResponse({ status: 200, type: UpdateCartDto })
  @Get()
  getCart(@CurrentUser() user: DecodedIdToken) {
    const cartKey = `cart-${user.sub}`;
    return this.cartsService.getCart(cartKey);
  }

  @ApiOperation({
    summary: 'Update your cart',
    description:
      'Update the items in your cart. Add or remove items in your cart',
  })
  @ApiResponse({ status: 200, type: UpdateCartDto })
  @Put()
  updateCart(
    @CurrentUser() user: DecodedIdToken,
    @Body() cartData: UpdateCartDto,
  ) {
    const cartKey = `cart-${user.sub}`;
    return this.cartsService.updateCart(cartKey, cartData);
  }

  @ApiOperation({
    summary: 'Clear your cart',
    description:
      'Removes all items from your cart. Note: Cart is automatically cleared when an order is placed.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        cart: {
          type: 'array',
          example: [],
        },
      },
    },
  })
  @Delete()
  async clear(@CurrentUser() user: DecodedIdToken) {
    const cartKey = `cart-${user.sub}`;
    await this.cartsService.clearCart(cartKey);
    return {
      cart: [],
    };
  }
}
