import { faker } from '@faker-js/faker';
import { CartItem, OrdersService } from 'src/orders/orders.service';
import { DataSource } from 'typeorm';
import createFakeProduct from './fakeProducts';
import { Product } from 'src/products/entities/product.entity';

type Options = {
  service: OrdersService;
  datasource: DataSource;
  productCount: number;
  orderCount: number;
};

export default async function createFakeOrders({
  service,
  datasource,
  productCount,
  orderCount,
}: Options) {
  for (let i = 0; i <= productCount; i++) {
    const testProduct = createFakeProduct();
    const product = datasource.getRepository(Product).create(testProduct);
    await datasource.getRepository(Product).save(product);
  }
  const products = await datasource.getRepository(Product).find();

  for (let i = 0; i < orderCount; i++) {
    // Randomly select products for each order
    const randomProducts = faker.helpers.arrayElements(products, {
      min: 2,
      max: 5,
    });

    const testCart: CartItem[] = randomProducts.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: faker.number.int({ min: 1, max: 10 }),
      image: item.images[0],
    }));

    await service.orderTransaction(testCart);
  }
}
