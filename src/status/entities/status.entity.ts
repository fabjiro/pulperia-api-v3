import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Product } from '../../product/entities/product.entity';
import { Pulperia } from '../../pulperia/entities/pulperia.entity';

@Entity()
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @OneToMany(() => Category, (category) => category.status)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.status)
  products: Product[];

  @OneToMany(() => Pulperia, (pulperia) => pulperia.status)
  pulperias: Pulperia[];
}
