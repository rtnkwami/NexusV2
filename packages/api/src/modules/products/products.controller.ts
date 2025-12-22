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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiOptionalQuery } from 'src/openapi-decorators/optional-query.decorator';
import {
  ProductSearchResponseDto,
  ProductWithoutOrdersDto,
} from './dto/search-product-response.dto';
import { Auth } from 'src/auth/auth.decorator';
import { SearchProductsQueryDto } from './dto/search-product.dto';

@Controller({
  path: 'products',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Create product',
    description: 'Create a product. Auth is required',
  })
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
  @ApiResponse({ status: 201, type: ProductWithoutOrdersDto })
  @Auth()
  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
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
  searchProducts(@Query() query: SearchProductsQueryDto) {
    const filters: ProductSearchFilters = {
      ...(query.q && { searchQuery: query.q }),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? { price: { min: query.minPrice, max: query.maxPrice } }
        : {}),
      ...(query.minStock !== undefined || query.maxStock !== undefined
        ? { stock: { min: query.minStock, max: query.maxStock } }
        : {}),
    };

    return this.productsService.searchProducts(
      filters,
      query.page,
      query.limit,
    );
  }

  @ApiOperation({
    summary: 'Get a product',
    description: 'Get a single product. A valid id must be used.',
  })
  @ApiResponse({ status: 200, type: ProductWithoutOrdersDto })
  @ApiNotFoundResponse({
    description: 'Missing or invalid authorization header',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product does not exist' },
      },
    },
  })
  @Get(':id')
  getProduct(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.getProduct(id);
  }

  @ApiOperation({
    summary: 'Update a product',
    description:
      'Update a single product. A valid id must be used. Auth is required.',
  })
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
  @ApiNotFoundResponse({
    description: 'Missing or invalid authorization header',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product does not exist' },
      },
    },
  })
  @ApiResponse({ status: 200, type: ProductWithoutOrdersDto })
  @ApiBody({ required: false, type: UpdateProductDto })
  @Auth()
  @Patch(':id')
  updateProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @ApiOperation({
    summary: 'Delete a product',
    description:
      'Delete a single product. A valid id must be used. Auth is required.',
  })
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
  @ApiNotFoundResponse({
    description: 'Missing or invalid authorization header',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product does not exist' },
      },
    },
  })
  @ApiResponse({ status: 200, type: ProductWithoutOrdersDto })
  @Auth()
  @Delete(':id')
  deleteProduct(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.removeProduct(id);
  }
}
