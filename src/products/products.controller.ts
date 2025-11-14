import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSearchFilters } from './types/product-search';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  search(
    @Query('q') q: string,
    @Query('minPrice') minPrice: number,
    @Query('maxPrice') maxPrice: number,
    @Query('minStock') minStock: number,
    @Query('maxStock') maxStock: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
