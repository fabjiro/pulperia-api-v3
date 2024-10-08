import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolModule } from '../rol/rol.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolModule, ImageModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
