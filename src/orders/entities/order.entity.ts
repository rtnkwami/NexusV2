import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderProduct } from './order-product.entity';

export type OrderStatusType = 'pending' | 'cancelled' | 'completed';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'cancelled', 'completed'],
    default: 'pending',
  })
  status: OrderStatusType;

  @Column()
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  products: OrderProduct[];
}
