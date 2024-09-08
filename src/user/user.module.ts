import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolModule } from '../rol/rol.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
