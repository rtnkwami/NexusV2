import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
