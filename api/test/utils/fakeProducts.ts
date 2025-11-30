import { faker } from '@faker-js/faker';

export type FakeProduct = {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
};

export default function createFakeProduct(
  overrides?: Partial<FakeProduct>,
): FakeProduct {
  const imageArray: string[] = [];

  for (let index = 0; index < 3; index++) {
    const image = faker.image.url();
    imageArray.push(image);
  }

  const product = {
    name: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    category: faker.commerce.department(),
    price: parseFloat(faker.commerce.price()),
    stock: faker.number.int({ min: 0, max: 200 }),
    images: imageArray,
  };

  return { ...product, ...(overrides ?? {}) };
}
