import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Point } from 'geojson';
import { IsNotEmpty } from 'class-validator';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Pulperia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @ManyToOne(() => User, (user) => user.pulperiasAsOwner)
  @IsNotEmpty()
  owner: User;

  @ManyToOne(() => User, (user) => user.pulperiasAsCreator)
  @IsNotEmpty()
  creator: User;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @IsNotEmpty()
  coordinates: Point;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
