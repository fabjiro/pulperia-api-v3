import { Module } from '@nestjs/common';
import { PulperiaService } from './pulperia.service';
import { PulperiaController } from './pulperia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pulperia } from './entities/pulperia.entity';
import { UserModule } from '../user/user.module';
import { StatusModule } from '../status/status.module';
import { PulperiaCategoryModule } from '../pulperia-category/pulperia-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pulperia]),
    UserModule,
    StatusModule,
    PulperiaCategoryModule,
  ],
  controllers: [PulperiaController],
  providers: [PulperiaService],
  exports: [PulperiaService],
})
export class PulperiaModule {}
