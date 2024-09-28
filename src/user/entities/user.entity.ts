import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { Rol } from '../../rol/entity/rol.entity';
import { Image } from '../../image/entity/image.entity';
import { Pulperia } from '../../pulperia/entities/pulperia.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @ManyToOne(() => Rol, (role) => role.users)
  rol: Rol;

  @ManyToOne(() => Image, (image) => image.users)
  avatar: Image;

  @OneToMany(() => Pulperia, (pulperia) => pulperia.owner)
  pulperiasAsOwner: Pulperia[];

  @OneToMany(() => Pulperia, (pulperia) => pulperia.creator)
  pulperiasAsCreator: Pulperia[];
}
