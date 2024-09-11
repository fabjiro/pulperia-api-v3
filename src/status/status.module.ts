import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Status])],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
