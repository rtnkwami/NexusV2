import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
    cascade: true,
  })
  products: Relation<OrderProduct[]>;

  @ManyToOne(() => User, (user) => user.orders)
  user: Relation<User>;
}
