import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from '../../status/entities/status.entity';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @ManyToOne(() => Status, (status) => status.categories) // Relación muchos-a-uno con Status
  status: Status;

  @OneToMany(() => Product, (product) => product.category) // Relación uno-a-muchos con Product
  products: Product[];
}
