import { Injectable } from '@nestjs/common';
import { PulperiaProduct } from './entites/pulperia.product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PulperiaProductService {
  constructor(
    @InjectRepository(PulperiaProduct)
    private readonly pulperiaProductRepository: Repository<PulperiaProduct>,
  ) {}

  async getPulperiaByProductsId(idProducts: number[]) {
    return await this.pulperiaProductRepository
      .createQueryBuilder('pulperiaProduct')
      .select('DISTINCT pulperiaProduct.pulperia_id')
      .where('pulperiaProduct.product_id IN (:...idProducts)', { idProducts })
      .getRawMany();
  }
}
