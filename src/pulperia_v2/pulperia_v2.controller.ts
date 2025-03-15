import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PulperiaV2Service } from './pulperia_v2.service';
import { JwtAuthGuard } from '../guard/auth.guard';
import { plainToInstance } from 'class-transformer';
import { UserResDto } from './dto/pulperia.res.dto';
import { PulperiaReqDto } from './dto/pulperia.req.dto';

@Controller('pulperia_v2')
export class PulperiaV2Controller {
  constructor(private readonly pulperiaV2Service: PulperiaV2Service) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard) // Usa los guards en cadena
  async findById(@Param('id') id: number) {
    try {
      const data = await this.pulperiaV2Service.getPulperiaById(id);

      return {
        ...data,
        owner: plainToInstance(UserResDto, data.owner),
        creator: plainToInstance(UserResDto, data.creator),
      };
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

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Body() data: PulperiaReqDto) {
    try {
      // talves validar si es admin puede actualizar
      //  si es el owner o el creator tambien
      return await this.pulperiaV2Service.updatePulperia(
        data.id,
        data.name,
        data.status,
      );
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }
}
