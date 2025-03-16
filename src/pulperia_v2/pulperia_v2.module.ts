import { Module } from '@nestjs/common';
import { PulperiaV2Service } from './pulperia_v2.service';
import { PulperiaV2Controller } from './pulperia_v2.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pulperia } from '../pulperia/entities/pulperia.entity';
import { PulperiaCategory } from '../pulperia-category/entites/pulperia.categorie.entity';
import { PulperiaProduct } from '../pulperia-product/entites/pulperia.product.entity';
import { Status } from '../status/entities/status.entity';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pulperia,
      PulperiaCategory,
      PulperiaProduct,
      Status,
    ]),
    ImageModule,
    // PulperiaCategoryModule,
    // PulperiaProductModule,
    // PulperiaCommunityModule,
  ],
  controllers: [PulperiaV2Controller],
  providers: [PulperiaV2Service],
  exports: [PulperiaV2Service],
})
export class PulperiaV2Module {}
