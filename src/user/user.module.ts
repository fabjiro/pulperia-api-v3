import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EncryptionService } from '../utils/encrypt.utils';
import { RolService } from '../rol/rol.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, EncryptionService, RolService],
  exports: [UserService, EncryptionService, RolService],
})
export class UserModule {}
