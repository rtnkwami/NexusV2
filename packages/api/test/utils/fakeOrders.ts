import { faker } from '@faker-js/faker';
import { CartItem, OrdersService } from 'src/orders/orders.service';
import { CartsService } from 'src/carts/carts.service';
import createFakeProduct from './fakeProducts';
import { PrismaClient } from 'src/generated/prisma/client';
import { randomUUID } from 'crypto';

type Options = {
  service: OrdersService;
  cartService: CartsService;
  prisma: PrismaClient;
  productCount: number;
  orderCount: number;
};

export default async function createFakeOrders({
  service,
  cartService,
  prisma,
  productCount,
  orderCount,
}: Options) {
  // Create products
  for (let i = 0; i <= productCount; i++) {
    const testProduct = createFakeProduct();
    await prisma.product.create({ data: testProduct });
  }

  const products = await prisma.product.findMany();

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'John Doe',
      email: `john.doe-${randomUUID()}@gmail.com`,
      avatar: 'https://johnspics.com/air.png',
    },
  });

  // Create orders
  for (let i = 0; i < orderCount; i++) {
    const cartKey = `test-cart-${i}`;

    // Randomly select products for each order
    const randomProducts = faker.helpers.arrayElements(products, {
      min: 2,
      max: 5,
    });

    const testCart: CartItem[] = randomProducts.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price.toNumber(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      image: item.images[0],
    }));

    // Store cart in cart service
    await cartService.updateCart(cartKey, { cart: testCart });

    // Create order using the cart key
    await service.createOrder(testUser.id, cartKey);
  }
}
