import { Module } from '@nestjs/common';
import { PulperiaCategoryService } from './pulperia-category.service';
import { PulperiaCategoryController } from './pulperia-category.controller';

@Module({
  controllers: [PulperiaCategoryController],
  providers: [PulperiaCategoryService],
  exports: [PulperiaCategoryService],
})
export class PulperiaCategoryModule {}
