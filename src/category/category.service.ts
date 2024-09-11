import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICreateCategory } from './interface/ICategory';
import { StatusService } from '../status/status.service';
import { STATUSENUM } from '../status/enum/status.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly statusService: StatusService,
  ) {}

  async create(category: ICreateCategory) {
    const status = await this.statusService.findOne(
      category.status ?? STATUSENUM.DISABLED,
    );

    const newCategory = this.categoryRepository.create({
      name: category.name,
      status,
    });

    return await this.categoryRepository.save(newCategory);
  }

  async findAll() {
    return await this.categoryRepository.find({
      relations: ['status'],
    });
  }

  async findOne(id: number) {
    return await this.categoryRepository.findOne({
      where: { id },
      relations: ['status'],
    });
  }
}
