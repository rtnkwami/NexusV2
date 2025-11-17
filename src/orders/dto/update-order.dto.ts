import { IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
