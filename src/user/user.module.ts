import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EncryptionService } from '../utils/encrypt.utils';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, EncryptionService],
  exports: [UserService, EncryptionService],
})
export class UserModule {}
