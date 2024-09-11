import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../guard/auth.guard';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      return await this.productService.create(createProductDto);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get()
  findAll(@Query('status') status?: number) {
    return this.productService.findAll(status);
  }
}
