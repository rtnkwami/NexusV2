export class CreateProductDto {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images?: string[];
}
