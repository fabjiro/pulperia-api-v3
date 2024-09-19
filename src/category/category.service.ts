import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICreateCategory, IUpdateCategory } from './interface/ICategory';
import { StatusService } from '../status/status.service';
import { STATUSENUM } from '../status/enum/status.enum';
import { ImageService } from '../image/image.service';
import { IMAGEENUM } from '../image/enum/image.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly statusService: StatusService,
    private readonly imageService: ImageService,
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

    const image = await this.imageService.findById(IMAGEENUM.DEFAULTCATEGORY);

    const newCategory = this.categoryRepository.create({
      name: category.name,
      status,
      image,
    });

    return await this.categoryRepository.save(newCategory);
  }

  async findAll(status?: number, products?: boolean) {
    if (status) {
      const statusDb = await this.statusService.findOne(status);

      if (!statusDb) {
        throw new Error('Status not found');
      }

      return await this.categoryRepository.find({
        where: { status: statusDb },
        relations: products
          ? ['status', 'products', 'image']
          : ['status', 'image'],
      });
    }
    return await this.categoryRepository.find({
      relations: ['status', 'image'],
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
