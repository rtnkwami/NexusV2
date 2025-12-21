import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductSearchFilters } from './types/product-search';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  async searchProducts(
    filters?: ProductSearchFilters,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      name: filters?.searchQuery && {
        contains: filters.searchQuery,
        mode: 'insensitive',
      },

      category: filters?.category && {
        contains: filters.category,
        mode: 'insensitive',
      },

      price: {
        gte: filters?.price?.min,
        lte: filters?.price?.max,
      },

      stock: {
        gte: filters?.stock?.min,
        lte: filters?.stock?.max,
      },
    };

    const [products, totalItems] = await Promise.all([
      this.prisma.product.findMany({ where, skip, take: limit }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      page,
      perPage: limit,
      count: products.length,
      total: totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async ensureSufficientProductStock(uuid: string, desiredQuantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: uuid },
    });

    if (!product) {
      throw new NotFoundException(
        `Product ${uuid} does not exist. Cannot be ordered`,
      );
    }

    const currentStock = product.stock;
    if (currentStock < desiredQuantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${product.name}. Available ${product.stock}, Requested: ${desiredQuantity}`,
      );
    }
  }

  async getProduct(uuid: string) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: uuid },
    });
    return product;
  }

  async updateProduct(uuid: string, data: Prisma.ProductUpdateInput) {
    const updatedProduct = this.prisma.product.update({
      where: { id: uuid },
      data,
    });
    return updatedProduct;
  }

  async removeProduct(uuid: string) {
    const deletedProduct = await this.prisma.product.delete({
      where: { id: uuid },
    });
    return deletedProduct;
  }
}
