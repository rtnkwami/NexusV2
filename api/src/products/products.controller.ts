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
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiOptionalQuery } from 'src/openapi-decorators/optional-query.decorator';
import {
  ProductSearchResponseDto,
  ProductWithoutOrdersDto,
} from './dto/search-product-response.dto';

@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create product',
    description: 'Create a product. Auth is required',
  })
  @ApiResponse({ status: 201, type: ProductWithoutOrdersDto })
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
  searchProducts(
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

  @ApiOperation({
    summary: 'Get a product',
    description: 'Get a single product. A valid uuid must be used.',
  })
  @ApiResponse({ status: 200, type: ProductWithoutOrdersDto })
  @Get(':uuid')
  getProduct(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.productsService.findOne(uuid);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a product',
    description:
      'Update a single product. A valid uuid must be used. Auth is required.',
  })
  @ApiResponse({ status: 200, type: ProductWithoutOrdersDto })
  @ApiBody({ required: false, type: UpdateProductDto })
  @Patch(':uuid')
  updateProduct(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(uuid, updateProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a product',
    description:
      'Delete a single product. A valid uuid must be used. Auth is required.',
  })
  @ApiResponse({ status: 200, type: ProductWithoutOrdersDto })
  @Delete(':uuid')
  deleteProduct(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.productsService.remove(uuid);
  }
}
