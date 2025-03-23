import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolModule } from '../rol/rol.module';
import { ImageModule } from '../image/image.module';
import { UserController } from './user.controller';
import { EncryptionService } from '../utils/encrypt.utils';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolModule, ImageModule],
  controllers: [UserController],
  providers: [UserService, EncryptionService],
  exports: [UserService],
})
export class UserModule {}
