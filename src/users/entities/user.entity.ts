import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  avatar: string;

  @OneToMany(() => Order, (orders) => orders.user)
  orders: Order[];
}
