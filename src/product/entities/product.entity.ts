import { IsNotEmpty } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Image } from '../../image/entity/image.entity';
import { Status } from '../../status/entities/status.entity';
import { Category } from '../../category/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @ManyToOne(() => Image, (image) => image.products)
  image: Image;

  @ManyToOne(() => Status, (status) => status.products)
  status: Status;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}
