import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('float', { nullable: true })
  price: number;

  @Column()
  stock: number;

  @Column('json', { nullable: true })
  images: string[];
}
