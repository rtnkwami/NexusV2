import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export class ProductWithoutOrdersDto extends OmitType(Product, ['orders']) {}

export class ProductSearchResponseDto {
  @ApiProperty({ type: [ProductWithoutOrdersDto] })
  data: ProductWithoutOrdersDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  perPage: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}
