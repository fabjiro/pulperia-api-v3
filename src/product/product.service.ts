import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusService } from '../status/status.service';
import { ImageService } from '../image/image.service';
import { ICreateProduct } from './interface/product.interface';
import { STATUSENUM } from '../status/enum/status.enum';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly statusService: StatusService,
    private readonly imageService: ImageService,
    private readonly categoryService: CategoryService,
  ) {}

  async deleteById(id: number) {
    const product = await this.findOne(id);

    if (!product) {
      throw new Error('Product not found');
    }
    const result = await this.productRepository.remove(product);

    await this.imageService.deleteById(product.image.id);

    return result;
  }

  async create(createProductDto: ICreateProduct) {
    const category = await this.categoryService.findOne(
      createProductDto.category,
    );

    if (!category) {
      throw new Error('Category not found');
    }

    const status = await this.statusService.findOne(
      createProductDto.status ?? STATUSENUM.REVIEW,
    );

    // post image
    const image = await this.imageService.saveImage(createProductDto.image);

    // create product
    const newProduct = this.productRepository.create({
      ...createProductDto,
      category,
      status,
      image,
    });

    return await this.productRepository.save(newProduct);
  }

  async findAll(status?: number) {
    if (status) {
      const statusDb = await this.statusService.findOne(status);

      if (!statusDb) {
        throw new Error('Status not found');
      }

      return await this.productRepository.find({
        where: { status: statusDb },
        relations: ['status', 'image', 'category'],
      });
    }
    return await this.productRepository.find({
      relations: ['status', 'image', 'category'],
    });
  }

  async findOne(id: number) {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['status', 'image'],
    });
  }
}
