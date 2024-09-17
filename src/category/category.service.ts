import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICreateCategory, IUpdateCategory } from './interface/ICategory';
import { StatusService } from '../status/status.service';
import { STATUSENUM } from '../status/enum/status.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly statusService: StatusService,
  ) {}

  async update(category: IUpdateCategory, id: number) {
    const categoryLocal = await this.findOne(id, true);

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.status) {
      const status = await this.statusService.findOne(category.status);

      if (!status) {
        throw new Error('Status not found');
      }

      categoryLocal.status = status;
    }

    if (category.name) {
      categoryLocal.name = category.name;
    }

    await this.categoryRepository.update(id, {
      name: categoryLocal.name,
      status: {
        id: categoryLocal.status?.id,
      },
    });

    return await this.findOne(id);
  }

  async create(category: ICreateCategory) {
    const status = await this.statusService.findOne(
      category.status ?? STATUSENUM.REVIEW,
    );

    const newCategory = this.categoryRepository.create({
      name: category.name,
      status,
    });

    return await this.categoryRepository.save(newCategory);
  }

  async findAll(status?: number) {
    if (status) {
      const statusDb = await this.statusService.findOne(status);

      if (!statusDb) {
        throw new Error('Status not found');
      }

      return await this.categoryRepository.find({
        where: { status: statusDb },
        relations: ['status'],
      });
    }
    return await this.categoryRepository.find({
      relations: ['status'],
    });
  }

  async findOne(id: number, relation: boolean = false) {
    return await this.categoryRepository.findOne({
      where: { id },
      relations: relation ? ['status', 'products'] : [],
    });
  }

  async deleteById(id: number) {
    const category = await this.findOne(id, true);

    if (!category) {
      throw new Error('Category not found');
    }

    if ((category.products ?? []).length > 0) {
      throw new Error('Category has products');
    }

    return await this.categoryRepository.remove(category);
  }
}
