import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ProductSearchFilters } from './types/product-search';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async search(filters?: ProductSearchFilters, page?: number, limit?: number) {
    const take = limit ?? 20;
    const currentPage = page ?? 1;
    const skip = ((currentPage ?? 1) - 1) * take;

    const whereClause: FindOptionsWhere<Product> = {};

    // Text search (name)
    if (filters?.searchQuery) {
      whereClause.name = ILike(`%${filters.searchQuery}%`);
    }

    // Price range
    if (filters?.price) {
      const { min, max } = filters.price;

      if (min != null && max != null) {
        whereClause.price = Between(min, max);
      } else if (min != null) {
        whereClause.price = MoreThanOrEqual(min);
      } else if (max != null) {
        whereClause.price = LessThanOrEqual(max);
      }
    }

    // Stock range
    if (filters?.stock) {
      const { min, max } = filters.stock;

      if (min != null && max != null) {
        whereClause.stock = Between(min, max);
      } else if (min != null) {
        whereClause.stock = MoreThanOrEqual(min);
      } else if (max != null) {
        whereClause.stock = LessThanOrEqual(max);
      }
    }

    // If no filters were set, let TypeORM ignore `where`
    const where = Object.keys(whereClause).length > 0 ? whereClause : undefined;

    const [products, totalItems] = await this.productRepository.findAndCount({
      where,
      skip,
      take,
    });

    return {
      data: products,
      page: currentPage,
      perPage: take,
      count: products.length,
      total: totalItems,
      totalPages: Math.ceil(totalItems / take),
    };
  }

  async ensureSufficientStock(uuid: string, desiredQuantity: number) {
    const product = await this.productRepository.findOneBy({ id: uuid });
    if (!product) {
      throw new NotFoundException('Product does not exist. Cannot be ordered');
    }

    const currentStock = product.stock;
    if (currentStock < desiredQuantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${product.name}. Available ${product.stock}, Requested: ${desiredQuantity}`,
      );
    }
  }

  findOne(uuid: string) {
    return this.productRepository.findOneBy({ id: uuid });
  }

  async update(uuid: string, updateProductDto: UpdateProductDto) {
    await this.productRepository.update(uuid, updateProductDto);
    return this.productRepository.findOneBy({ id: uuid });
  }

  remove(uuid: string) {
    return this.productRepository.delete(uuid);
  }
}
