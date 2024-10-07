import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Pulperia } from '../../pulperia/entities/pulperia.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('pulperia_category')
export class PulperiaCategory {
  @PrimaryColumn()
  pulperia_id: number;

  @PrimaryColumn()
  categorie_id: number;

  @ManyToOne(() => Pulperia, (pulperia) => pulperia.categorys)
  @JoinColumn({ name: 'pulperia_id' })
  pulperia?: Pulperia;

  @ManyToOne(() => Category, (categorie) => categorie.pulperias)
  @JoinColumn({ name: 'categorie_id' })
  categorie?: Category;
}
