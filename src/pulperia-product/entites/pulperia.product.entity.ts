import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Pulperia } from '../../pulperia/entities/pulperia.entity';
import { Product } from '../../product/entities/product.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('pulperia_product')
export class PulperiaProduct {
  @PrimaryColumn()
  pulperia_id: number;

  @PrimaryColumn()
  product_id: number;

  @PrimaryColumn()
  category_id: number;

  @ManyToOne(() => Pulperia, (pulperia) => pulperia.products)
  @JoinColumn({ name: 'pulperia_id' })
  pulperia: Pulperia;

  @ManyToOne(() => Product, (product) => product.pulperias)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Category, (category) => category.categorys)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
