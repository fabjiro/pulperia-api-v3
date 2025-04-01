import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { StatusService } from '../status/status.service';
import { ImageService } from '../image/image.service';
import {
  ICreateProduct,
  IGetProductByName,
  IProductGet,
  IUpdateProduct,
} from './interface/product.interface';
import { STATUSENUM } from '../status/enum/status.enum';
import { IMAGEENUM } from '../image/enum/image.enum';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly statusService: StatusService,
    private readonly imageService: ImageService,
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
      const category = await this.categoryRepository.findOneBy({
        id: updateProductDto.category,
      });

      if (!category) {
        throw new Error('Category not found');
      }

      product.category = category;
    }

    if (updateProductDto.image) {
      const newImage = await this.imageService.create(updateProductDto.image);

      await this.productRepository.update(id, {
        image: {
          id: newImage.id,
        },
      });

      await this.imageService.deleteById(product.image.id);

      product.image = newImage;
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
    const product = await this.findOne(id, true);

    if (!product) {
      throw new Error('Product not found');
    }
    const result = await this.productRepository.remove(product);

    await this.imageService.deleteById(product.image.id);

    return result;
  }

  async create(createProductDto: ICreateProduct) {
    const category = await this.categoryRepository.findOneBy({
      id: createProductDto.category,
    });

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

  async findByFilter(query: IProductGet) {
    const { status, categoryId } = query;

    if (status) {
      const statusDb = await this.statusService.findOne(status);

      if (!statusDb) {
        throw new Error('Status not found');
      }
    }

    if (categoryId) {
      const category = await this.categoryRepository.findOneBy({
        id: categoryId,
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    return await this.productRepository.find({
      where: {
        ...(status !== null && {
          status: {
            id: status,
          },
        }),
        ...(categoryId !== null && {
          category: {
            id: categoryId,
          },
        }),
      },
      relations: ['status', 'image'],
    });
  }

  async getProductsByName(query: IGetProductByName) {
    const { name, status } = query;

    const [categorys, products] = await Promise.all([
      this.categoryRepository.find({
        where: {
          statusId: status,
          name: ILike(`%${name}%`),
        },
        relations: ['products', 'products.image'],
      }),
      this.productRepository.find({
        where: {
          statusId: status,
          name: ILike(`%${name}%`),
        },
        relations: ['image'],
      }),
    ]);

    const uniqueIds = new Set();
    const resultado = [];

    // Agregar productos de categorías
    for (const category of categorys) {
      for (const product of category.products) {
        if (product.statusId === status && !uniqueIds.has(product.id)) {
          uniqueIds.add(product.id);
          resultado.push(product);
        }
      }
    }

    // Agregar productos
    for (const product of products) {
      if (!uniqueIds.has(product.id)) {
        uniqueIds.add(product.id);
        resultado.push(product);
      }
    }

    return resultado;
  }

  async findAll() {
    return await this.productRepository.find({
      relations: ['status', 'image', 'category'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, relation: boolean = false) {
    return await this.productRepository.findOne({
      where: { id },
      relations: relation ? ['status', 'image', 'category'] : [],
      order: { id: 'DESC' },
    });
  }
}
