import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSearchFilters } from './types/product-search';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  OmitType,
} from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { ApiOptionalQuery } from 'src/openapi-decorators/optional-query.decorator';
import { ProductSearchResponseDto } from './dto/search-product-response.dto';

@ApiBearerAuth()
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Create product.',
    description: 'Create a product. Auth is required',
  })
  @ApiResponse({ status: 201, type: OmitType(Product, ['orders']) })
  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({
    summary: 'Get products',
    description: 'Search for products given filters',
  })
  @ApiOptionalQuery([
    'q',
    'minPrice',
    'maxPrice',
    'minStock',
    'maxStock',
    'page',
    'limit',
  ])
  @ApiResponse({ status: 200, type: ProductSearchResponseDto })
  @Get()
  search(
    @Query('q') q?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minStock') minStock?: number,
    @Query('maxStock') maxStock?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters: ProductSearchFilters = {
      ...(q && { searchQuery: q }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? { price: { min: minPrice, max: maxPrice } }
        : {}),
      ...(minStock !== undefined || maxStock !== undefined
        ? { stock: { min: minStock, max: maxStock } }
        : {}),
    };

    return this.productsService.search(filters, page, limit);
  }

  @Get(':uuid')
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.productsService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(uuid, updateProductDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.productsService.remove(uuid);
  }
}
