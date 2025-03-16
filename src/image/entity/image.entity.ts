import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Category } from '../../category/entities/category.entity';
import { Pulperia } from '../../pulperia/entities/pulperia.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  original_link: string;

  @Column()
  @IsNotEmpty()
  min_link: string;

  @OneToMany(() => Category, (category) => category.image)
  categories: Category[];

  @OneToMany(() => User, (user) => user.avatar)
  users: User[];

  @OneToMany(() => Product, (product) => product.image)
  products: Product[];

  @OneToMany(() => Pulperia, (pulperia) => pulperia.avatar)
  pulperias: Pulperia[];
}
