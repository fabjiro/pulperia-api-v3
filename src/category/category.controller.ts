import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  NotFoundException,
  Delete,
  Param,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../guard/auth.guard';
import { Roles } from '../rol/decorators/rols.decorator';
import { RolEnum } from '../rol/enum/RolEnum';
import { RolesGuard } from '../rol/guards/role.guard';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(RolEnum.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      return await this.categoryService.create(createCategoryDto);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Delete(':id')
  @Roles(RolEnum.ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: number) {
    try {
      return await this.categoryService.deleteById(id);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
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
