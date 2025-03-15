import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pulperia } from '../pulperia/entities/pulperia.entity';
import { PulperiaCategory } from '../pulperia-category/entites/pulperia.categorie.entity';
import { PulperiaProduct } from '../pulperia-product/entites/pulperia.product.entity';
import { Status } from '../status/entities/status.entity';

@Injectable()
export class PulperiaV2Service {
  constructor(
    @InjectRepository(Pulperia)
    private readonly pulperiaRepository: Repository<Pulperia>,
    @InjectRepository(PulperiaCategory)
    private readonly pulperiaCategoryRepository: Repository<PulperiaCategory>,
    @InjectRepository(PulperiaProduct)
    private readonly pulperiaProductRepository: Repository<PulperiaProduct>,
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  async getPulperiaById(id: number) {
    return await this.pulperiaRepository.findOne({
      where: {
        id,
      },
      relations: [
        'status',
        'owner',
        'owner.avatar',
        'creator',
        'creator.avatar',
      ],
    });
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

  async updatePulperia(id: number, name?: string, status?: number) {
    const pulperia = await this.pulperiaRepository.findOne({
      where: {
        id,
      },
    });

    if (!pulperia) {
      throw new Error('Pulperia not found');
    }

    if (name) {
      pulperia.name = name;
    }

    if (status) {
      const statusRes = await this.statusRepository.findOneBy({
        id: status,
      });

      if (!statusRes) {
        throw new Error('Status not found');
      }

      pulperia.status = statusRes;
    }

    pulperia.updatedAt = new Date();

    return await this.pulperiaRepository.save(pulperia);
  }
}
