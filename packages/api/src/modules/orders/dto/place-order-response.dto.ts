import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum } from 'src/generated/prisma/enums';

export class PlaceOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ enum: OrderStatusEnum })
  status: OrderStatusEnum;

  @ApiProperty({
    type: 'string',
    description: 'Order total as a decimal string',
  })
  total: number;

  @ApiProperty()
  userId: string;
}
