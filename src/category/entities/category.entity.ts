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

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ name: 'statusId' })
  statusId: number;

  @Column({ name: 'imageId' })
  imageId: number;

  @OneToMany(
    () => PulperiaCategory,
    (pulperiaCategory) => pulperiaCategory.categorie,
  )
  pulperias: PulperiaCategory[];

  @ManyToOne(() => Image, (image) => image.categories)
  image: Image;

  @ManyToOne(() => Status, (status) => status.categories)
  status: Status;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
