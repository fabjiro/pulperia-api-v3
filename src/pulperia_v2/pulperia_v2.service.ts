import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pulperia } from '../pulperia/entities/pulperia.entity';
import { PulperiaCategory } from '../pulperia-category/entites/pulperia.categorie.entity';
import { PulperiaProduct } from '../pulperia-product/entites/pulperia.product.entity';
import { Status } from '../status/entities/status.entity';
import { ImageService } from '../image/image.service';
import { IMAGECONST } from '../image/const/image.const';

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
    private readonly imageService: ImageService,
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
        'avatar',
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

  async updatePulperia(
    id: number,
    name?: string,
    status?: number,
    file?: Express.Multer.File,
  ) {
    const pulperia = await this.pulperiaRepository.findOne({
      where: {
        id,
      },
      relations: ['avatar'],
    });

    if (!pulperia) {
      throw new Error('Pulperia not found');
    }

    // update name
    if (name) {
      pulperia.name = name;
    }

    // update status
    if (status) {
      const statusRes = await this.statusRepository.findOneBy({
        id: status,
      });

      if (!statusRes) {
        throw new Error('Status not found');
      }

      pulperia.status = statusRes;
    }

    // update avatar
    if (file) {
      const imageDb = await this.imageService.findById(pulperia.avatar.id);
      if (!imageDb) {
        throw new Error('Image not found');
      }

      const newImage = await this.imageService.uploadFile(file);
      pulperia.avatar.id = newImage.id;

      await this.pulperiaRepository.save(pulperia);

      if (imageDb.id !== IMAGECONST.PULPERIA) {
        await this.imageService.deleteById(imageDb.id);
      }
    }

    pulperia.updatedAt = new Date();

    return await this.pulperiaRepository.save(pulperia);
  }
}
