import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusService } from '../status/status.service';
import { ImageService } from '../image/image.service';
import { ICreateProduct, IUpdateProduct } from './interface/product.interface';
import { STATUSENUM } from '../status/enum/status.enum';
import { CategoryService } from '../category/category.service';
import { IMAGEENUM } from '../image/enum/image.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly statusService: StatusService,
    private readonly imageService: ImageService,
    private readonly categoryService: CategoryService,
  ) {}

  async update(updateProductDto: IUpdateProduct, id: number) {
    const product = await this.findOne(id, true);

    if (!product) {
      throw new Error('Product not found');
    }

    if (updateProductDto.name) {
      product.name = updateProductDto.name;
    }

    if (updateProductDto.status) {
      const status = await this.statusService.findOne(updateProductDto.status);
      if (!status) {
        throw new Error('Status not found');
      }
      product.status = status;
    }

    if (updateProductDto.category) {
      const category = await this.categoryService.findOne(
        updateProductDto.category,
      );

      if (!category) {
        throw new Error('Category not found');
      }

      product.category = category;
    }

    if (updateProductDto.image) {
      await Promise.all([
        this.imageService.deleteImagePost(product.image.original_link),
        this.imageService.deleteImagePost(product.image.min_link),
        this.imageService.update(product.image, updateProductDto.image),
      ]);
    }

    await this.productRepository.update(id, {
      name: product.name,
      status: {
        id: product.status?.id,
      },
      category: {
        id: product.category?.id,
      },
      image: {
        id: product.image?.id,
      },
    });

    return await this.findOne(id);
  }

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

    // create product
    const newProduct = this.productRepository.create({
      ...createProductDto,
      category,
      status,
      image: null,
    });

    if (createProductDto.image) {
      const image = await this.imageService.create(createProductDto.image);
      newProduct.image = image;
    } else {
      const defaultImage = await this.imageService.findById(
        IMAGEENUM.DEFAULTPRODUCT,
      );
      newProduct.image = defaultImage;
    }

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

  async findOne(id: number, relation: boolean = false) {
    return await this.productRepository.findOne({
      where: { id },
      relations: relation ? ['status', 'image', 'category'] : [],
    });
  }
}
