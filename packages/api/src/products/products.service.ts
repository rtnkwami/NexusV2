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
    page?: number,
    limit?: number,
  ) {
    const take = limit ?? 20;
    const currentPage = page ?? 1;
    const skip = ((currentPage ?? 1) - 1) * take;

    const whereClause: Prisma.ProductWhereInput = {};

    // Text search
    if (filters?.searchQuery) {
      whereClause.name = {
        contains: filters.searchQuery,
        mode: 'insensitive',
      };
    }

    if (filters?.category) {
      whereClause.category = {
        contains: filters.category,
        mode: 'insensitive',
      };
    }

    // Price range
    if (filters?.price) {
      const { min, max } = filters.price;

      if (min != null && max != null) {
        whereClause.price = {
          gte: min,
          lte: max,
        };
      } else if (min != null) {
        whereClause.price = {
          gte: min,
        };
      } else if (max != null) {
        whereClause.price = {
          lte: max,
        };
      }
    }

    // Stock range
    if (filters?.stock) {
      const { min, max } = filters.stock;

      if (min != null && max != null) {
        whereClause.stock = {
          gte: min,
          lte: max,
        };
      } else if (min != null) {
        whereClause.stock = {
          gte: min,
        };
      } else if (max != null) {
        whereClause.stock = {
          lte: max,
        };
      }
    }

    // If no filters were set, pass empty object (Prisma handles this correctly)
    const where = Object.keys(whereClause).length > 0 ? whereClause : undefined;

    const [products, totalItems] = await Promise.all([
      this.prisma.product.findMany({ where, skip, take }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      page: currentPage,
      perPage: take,
      count: products.length,
      total: totalItems,
      totalPages: Math.ceil(totalItems / take),
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
