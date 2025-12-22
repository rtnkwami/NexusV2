import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OrderStatus } from './update-order.dto';

class DateRangeDto {
  @ApiProperty({ example: '2025-01-01', type: String })
  @IsString()
  from: string;

  @ApiProperty({ example: '2025-12-31', type: String })
  @IsString()
  to: string;
}

export class OrdersSearchDto {
  @ApiPropertyOptional({ type: DateRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
