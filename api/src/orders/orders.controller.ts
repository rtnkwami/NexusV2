import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Auth } from 'src/auth/auth.decorator';
import { CurrentUser } from 'src/auth/user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing or invalid authorization header',
  schema: {
    properties: {
      statusCode: { type: 'number', example: 401 },
      message: { type: 'string', example: 'Missing Authorization Header' },
    },
  },
})
@ApiForbiddenResponse({
  description: 'User has no role assigned or insufficient permissions',
  schema: {
    properties: {
      statusCode: { type: 'number', example: 403 },
      message: { type: 'string', example: 'Insufficient permissions' },
    },
  },
})
@Controller({
  path: 'orders',
})
@Auth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@CurrentUser() user: DecodedIdToken) {
    const cartKey = `cart-${user.sub}`;
    return this.ordersService.placeOrder(cartKey, user.sub);
  }

  @Get()
  searchOrders() {
    return this.ordersService.searchOrders();
  }

  @Get(':uuid')
  getOrder(@Param('uuid') uuid: string) {
    return this.ordersService.getOrder(uuid);
  }

  @Patch(':uuid')
  updateStatus(
    @Param('uuid') uuid: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const newStatus = updateOrderDto.status;
    return this.ordersService.updateOrderStatus(uuid, newStatus);
  }
}
