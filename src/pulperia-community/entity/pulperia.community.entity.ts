import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Pulperia } from '../../pulperia/entities/pulperia.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class PulperiaComunnity {
  @PrimaryColumn()
  pulperia_id: number;

  @PrimaryColumn()
  user_id: number;

  @ManyToOne(() => Pulperia, (pulperia) => pulperia.users)
  @JoinColumn({ name: 'pulperia_id' })
  pulperia: Pulperia;

  @ManyToOne(() => User, (user) => user.pulperias)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
