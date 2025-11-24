import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Auth } from 'src/auth/auth.decorator';
import { CurrentUser } from 'src/auth/user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller({
  path: 'orders',
})
@Auth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: DecodedIdToken) {
    const cartKey = `cart-${user.sub}`;
    return this.ordersService.create(cartKey);
  }

  @Get()
  search() {
    return this.ordersService.search();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.ordersService.findOne(uuid);
  }

  @Patch(':uuid')
  updateStatus(
    @Param('uuid') uuid: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const newStatus = updateOrderDto.status;
    return this.ordersService.updateStatus(uuid, newStatus);
  }
}
