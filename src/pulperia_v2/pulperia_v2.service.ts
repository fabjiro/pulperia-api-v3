import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pulperia } from '../pulperia/entities/pulperia.entity';
import { StatusService } from '../status/status.service';
import { UserService } from '../user/user.service';
import { PulperiaCategory } from '../pulperia-category/entites/pulperia.categorie.entity';
import { PulperiaProduct } from '../pulperia-product/entites/pulperia.product.entity';

@Injectable()
export class PulperiaV2Service {
  constructor(
    @InjectRepository(Pulperia)
    private readonly pulperiaRepository: Repository<Pulperia>,
    @InjectRepository(PulperiaCategory)
    private readonly pulperiaCategoryRepository: Repository<PulperiaCategory>,
    @InjectRepository(PulperiaProduct)
    private readonly pulperiaProductRepository: Repository<PulperiaProduct>,
    private readonly userService: UserService,
    private readonly statusService: StatusService,
  ) {}

  async getPulperiaById(id: number) {
    return await this.pulperiaRepository.findOneBy({ id });
  }

  async getCategoryByPulperiaId(pulperiaId: number, status?: number) {
    const categorys = await this.pulperiaCategoryRepository.find({
      where: {
        pulperia_id: pulperiaId,
        categorie: {
          status: {
            id: status,
          },
        },
      },
      relations: ['categorie', 'categorie.status', 'categorie.image'],
    });

    return categorys.map((e) => e.categorie);
  }

  async getProductByPulperiaId(
    pulperiaId: number,
    status?: number,
    category?: number,
  ) {
    const products = await this.pulperiaProductRepository.find({
      where: {
        pulperia_id: pulperiaId,
        product: {
          status: {
            id: status,
          },
          category: {
            id: category,
          },
        },
      },
      relations: [
        'product',
        'product.status',
        'product.image',
        // 'product.category',
      ],
    });

    return products.map((e) => e.product);
  }
}
