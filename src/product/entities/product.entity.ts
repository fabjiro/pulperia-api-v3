import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from '../../image/entity/image.entity';
import { Status } from '../../status/entities/status.entity';
import { Category } from '../../category/entities/category.entity';
import { PulperiaProduct } from '../../pulperia-product/entites/pulperia.product.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ name: 'statusId' })
  statusId: number;

  @Column({ name: 'imageId' })
  imageId: number;

  @Column({ name: 'categoryId' })
  categoryId: number;

  @OneToMany(
    () => PulperiaProduct,
    (pulperiaProduct) => pulperiaProduct.product,
  )
  pulperias: PulperiaProduct[];

  @ManyToOne(() => Image, (image) => image.products)
  image: Image;

  @ManyToOne(() => Status, (status) => status.products)
  status: Status;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}
