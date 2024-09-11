import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../guard/auth.guard';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  async findAll(@Query('status') status?: number) {
    try {
      return await this.categoryService.findAll(status);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }
}
