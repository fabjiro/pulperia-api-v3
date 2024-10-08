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
import { Image } from '../../image/entity/image.entity';
import { PulperiaCategory } from '../../pulperia-category/entites/pulperia.categorie.entity';
import { PulperiaProduct } from '../../pulperia-product/entites/pulperia.product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @OneToMany(
    () => PulperiaCategory,
    (pulperiaCategory) => pulperiaCategory.categorie,
  )
  pulperias: PulperiaCategory[];

  @OneToMany(
    () => PulperiaProduct,
    (pulperiaProduct) => pulperiaProduct.category,
  )
  categorys: PulperiaProduct[];

  @ManyToOne(() => Image, (image) => image.categories)
  image: Image;

  @ManyToOne(() => Status, (status) => status.categories)
  status: Status;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
