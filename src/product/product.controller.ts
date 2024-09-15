import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  Query,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../guard/auth.guard';
import { Roles } from '../rol/decorators/rols.decorator';
import { RolesGuard } from '../rol/guards/role.guard';
import { RolEnum } from '../rol/enum/RolEnum';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Put(':id')
  @Roles(RolEnum.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      return await this.productService.update(updateProductDto, id);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Post()
  @Roles(RolEnum.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      return await this.productService.create(createProductDto);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Delete(':id')
  @Roles(RolEnum.ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: number) {
    try {
      return await this.productService.deleteById(id);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get()
  findAll(@Query('status') status?: number) {
    return this.productService.findAll(status);
  }
}
