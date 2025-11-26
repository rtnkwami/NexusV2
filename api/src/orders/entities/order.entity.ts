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
import { OrderStatus } from '../dto/update-order.dto';

export type OrderStatusType = 'pending' | 'cancelled' | 'completed';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatusType;

  @Column()
  total: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  products: OrderProduct[];

  @ManyToOne(() => User, (user) => user.orders)
  user: User;
}
