import { OrderProduct } from 'src/orders/entities/order-product.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column()
  stock: number;

  @Column('json', { nullable: true })
  images: string[];

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
  orders: OrderProduct[];
}
