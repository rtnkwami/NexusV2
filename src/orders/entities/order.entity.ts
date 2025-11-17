import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderProduct } from './order-product.entity';
import { User } from 'src/users/entities/user.entity';

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

  @ManyToOne(() => User, (user) => user.orders)
  user: User;
}
