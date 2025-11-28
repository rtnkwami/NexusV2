import { faker } from '@faker-js/faker';

export default function createFakeProduct() {
  const imageArray: string[] = [];

  for (let index = 0; index < 3; index++) {
    const image = faker.image.url();
    imageArray.push(image);
  }

  return {
    name: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    category: faker.helpers.arrayElement([
      'Electronics',
      faker.commerce.department(),
    ]),
    price: parseFloat(faker.commerce.price()),
    stock: faker.number.int({ min: 0, max: 200 }),
    images: imageArray,
  };
}
