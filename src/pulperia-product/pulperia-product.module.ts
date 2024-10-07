import { Module } from '@nestjs/common';
import { PulperiaProductService } from './pulperia-product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PulperiaProduct } from './entites/pulperia.product.entity';
import { Product } from '../product/entities/product.entity';
import { Pulperia } from '../pulperia/entities/pulperia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pulperia, Product, PulperiaProduct])],
  providers: [PulperiaProductService],
  exports: [PulperiaProductService],
})
export class PulperiaProductModule {}
