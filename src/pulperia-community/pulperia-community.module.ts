import { Module } from '@nestjs/common';
import { PulperiaCommunityService } from './pulperia-community.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PulperiaComunnity } from './entity/pulperia.community.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PulperiaComunnity])],
  providers: [PulperiaCommunityService],
  exports: [PulperiaCommunityService],
})
export class PulperiaCommunityModule {}
