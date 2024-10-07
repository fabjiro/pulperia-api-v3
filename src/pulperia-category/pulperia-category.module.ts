import { Module } from '@nestjs/common';
import { PulperiaCategoryService } from './pulperia-category.service';
import { PulperiaCategory } from './entites/pulperia.categorie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PulperiaCategory])],
  providers: [PulperiaCategoryService],
  exports: [PulperiaCategoryService],
})
export class PulperiaCategoryModule {}
