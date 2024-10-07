import { Injectable } from '@nestjs/common';
import { PulperiaCategory } from './entites/pulperia.categorie.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { STATUSENUM } from '../status/enum/status.enum';

@Injectable()
export class PulperiaCategoryService {
  constructor(
    @InjectRepository(PulperiaCategory)
    private readonly pulperiaCategoryRepository: Repository<PulperiaCategory>,
  ) {}

  async addCategoryToPulperia(idPulperia: number, idCategory: number) {
    const createdPulperiaCategory = this.pulperiaCategoryRepository.create({
      pulperia_id: idPulperia,
      categorie_id: idCategory,
    });

    return await this.pulperiaCategoryRepository.save(createdPulperiaCategory);
  }

  async getCategoriesByPulperia(idPulperia: number, idStatus?: number) {
    return await this.pulperiaCategoryRepository.find({
      where: {
        pulperia_id: idPulperia,
        categorie: {
          status: {
            id: idStatus ?? STATUSENUM.ACTIVE,
          },
        },
      },
      relations: ['categorie', 'categorie.status', 'categorie.image'],
    });
  }
}
