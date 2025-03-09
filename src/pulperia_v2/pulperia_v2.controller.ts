import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PulperiaV2Service } from './pulperia_v2.service';
import { JwtAuthGuard } from '../guard/auth.guard';

@Controller('pulperia_v2')
export class PulperiaV2Controller {
  constructor(private readonly pulperiaV2Service: PulperiaV2Service) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: number) {
    try {
      return await this.pulperiaV2Service.getPulperiaById(id);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get(':id/category')
  @UseGuards(JwtAuthGuard)
  async findCategoryById(
    @Param('id') id: number,
    @Query('status') status?: number,
  ) {
    try {
      return await this.pulperiaV2Service.getCategoryByPulperiaId(id, status);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get(':id/product')
  @UseGuards(JwtAuthGuard)
  async findProductById(
    @Param('id') id: number,
    @Query('status') status?: number,
    @Query('category') category?: number,
  ) {
    try {
      return await this.pulperiaV2Service.getProductByPulperiaId(
        id,
        status,
        category,
      );
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }
}
