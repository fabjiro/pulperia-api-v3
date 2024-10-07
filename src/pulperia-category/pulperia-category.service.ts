import { Injectable } from '@nestjs/common';
import { PulperiaCategory } from './entites/pulperia.categorie.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from '../category/category.service';
import { PulperiaService } from '../pulperia/pulperia.service';

@Injectable()
export class PulperiaCategoryService {
  constructor(
    @InjectRepository(PulperiaCategory)
    private readonly pulperiaCategoryRepository: Repository<PulperiaCategory>,
    private readonly categoryService: CategoryService,
    private readonly pulperiaService: PulperiaService,
  ) {}

  async addCategoryToPulperia(idPulperia: number, idCategory: number) {
    const pulperia = await this.pulperiaService.findById(idPulperia);

    if (!pulperia) {
      throw new Error('Pulperia not found');
    }

    const category = await this.categoryService.findOne(idCategory);

    if (!category) {
      throw new Error('Category not found');
    }

    const createdPulperiaCategory = this.pulperiaCategoryRepository.create({
      pulperia_id: idPulperia,
      categorie_id: idPulperia,
    });

    return await this.pulperiaCategoryRepository.save(createdPulperiaCategory);
  }
}
