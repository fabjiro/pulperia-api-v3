import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ICreateCategory,
  IGetCountByCategory,
  IUpdateCategory,
} from './interface/ICategory';
import { StatusService } from '../status/status.service';
import { STATUSENUM } from '../status/enum/status.enum';
import { ImageService } from '../image/image.service';
import { IMAGEENUM } from '../image/enum/image.enum';
import { GeneratorUtils } from '../utils/generator.utils';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly statusService: StatusService,
    private readonly imageService: ImageService,
  ) {}

  async update(category: IUpdateCategory, id: number) {
    const categoryLocal = await this.findOne(id);

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.status) {
      categoryLocal.statusId = category.status;
    }

    if (category.name) {
      categoryLocal.name = category.name;
    }

    if (category.image) {
      const newImage = await this.imageService.create(category.image);

      await this.categoryRepository.update(id, {
        imageId: newImage.id,
      });

      await this.imageService.deleteById(categoryLocal.imageId);

      categoryLocal.imageId = newImage.id;
    }

    await this.categoryRepository.update(id, categoryLocal);

    return id;
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

  async findAll(status?: number) {
    if (status) {
      const statusDb = await this.statusService.findOne(status);

      if (!statusDb) {
        throw new Error('Status not found');
      }

      return await this.categoryRepository.find({
        where: { status: statusDb },
        relations: ['status', 'image'],
        order: { id: 'DESC' },
      });
    }
    return await this.categoryRepository.find({
      relations: ['status', 'image'],
      order: { id: 'DESC' },
    });
  }

  async getCountProductByCategory(data: IGetCountByCategory) {
    return await this.productRepository.count({
      where: {
        category: {
          id: data.categoryId,
        },
        status: {
          id: data.status,
        },
      },
    });
  }

  async getCountProductsByCategories(categoryIds: number[], status: number) {
    const counts = await this.productRepository
      .createQueryBuilder('product')
      .select('product.categoryId, COUNT(product.id) as count')
      .where('product.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('product.status.id = :status', { status })
      .groupBy('product.categoryId')
      .getRawMany();

    return counts.reduce((acc, { categoryId, count }) => {
      acc[categoryId] = count;
      return acc;
    }, {});
  }

  async findOne(id: number, relation: boolean = false) {
    return await this.categoryRepository.findOne({
      where: { id },
      relations: relation
        ? ['status', 'products', 'image', 'products.image']
        : [],
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

  async generateImages(categoryId: number) {
    const category = await this.findOne(categoryId, true);

    if (!category) {
      throw new Error('Category not found');
    }

    const images = category.products.map((product) => product.image.min_link);

    if (images.length === 0) {
      throw new Error('Category has no products');
    }

    const randomImage = images.sort(() => 0.5 - Math.random());
    const imageToGrid = randomImage.slice(0, 5);

    const gridImage =
      await GeneratorUtils.createSuperposedImageAndGetBase64(imageToGrid);

    await this.update(
      {
        image: gridImage,
      },
      categoryId,
    );

    return await this.findOne(categoryId, true);
  }
}
