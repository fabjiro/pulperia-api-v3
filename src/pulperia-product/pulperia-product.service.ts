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

  async addPulperiaProduct(idPulperia: number, idProduct: number) {
    const newPulperiaProduct = this.pulperiaProductRepository.create({
      pulperia_id: idPulperia,
      product_id: idProduct,
    });
    return await this.pulperiaProductRepository.save(newPulperiaProduct);
  }
}
