import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

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

  @OneToMany(() => User, (user) => user.avatar)
  users: User[];
}
