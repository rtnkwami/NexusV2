import { it, expect, describe, beforeAll, beforeEach, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'src/data-source';
import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderProduct } from 'src/orders/entities/order-product.entity';
import { User } from 'src/users/entities/user.entity';

describe('ProductService', () => {
  let service: ProductsService;
  let datasource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...AppDataSource.options,
          entities: [Product, Order, OrderProduct, User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Product, Order, OrderProduct, User]),
      ],
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    datasource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await datasource.destroy();
  });

  beforeEach(async () => {
    await datasource.query('TRUNCATE TABLE product CASCADE;');
  });

  const testProduct = {
    name: 'Rice',
    description: 'Grown in Africa',
    price: 250.5,
    category: 'Food',
    stock: 100,
  };

  it('should create a product', async () => {
    const product = await service.createProduct(testProduct);
    expect(product).not.toBeNull();
    expect(product.name).toBe(testProduct.name);
  });

  it('should get a product by id', async () => {
    const product = await service.createProduct(testProduct);
    const newProduct = await service.getProduct(product.id);

    expect(newProduct.id).toBe(newProduct.id);
  });
});
