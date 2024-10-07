import { Module } from '@nestjs/common';
import { PulperiaCategoryService } from './pulperia-category.service';
import { PulperiaCategory } from './entites/pulperia.categorie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { PulperiaModule } from '../pulperia/pulperia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PulperiaCategory]),
    CategoryModule,
    PulperiaModule,
  ],
  providers: [PulperiaCategoryService],
  exports: [PulperiaCategoryService],
})
export class PulperiaCategoryModule {}
