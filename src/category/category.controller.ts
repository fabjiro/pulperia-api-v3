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
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/create-category.dto';
import { JwtAuthGuard } from '../guard/auth.guard';
import { Roles } from '../rol/decorators/rols.decorator';
import { RolEnum } from '../rol/enum/RolEnum';
import { RolesGuard } from '../rol/guards/role.guard';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Put(':id')
  @Roles(RolEnum.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      return await this.categoryService.update(updateCategoryDto, id);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

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
  async findAll(
    @Query('status') status?: number,
    @Query('products') products?: boolean,
  ) {
    try {
      return await this.categoryService.findAll(status, products);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.categoryService.findOne(id, true);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }
}
