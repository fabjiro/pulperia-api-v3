import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  NotFoundException,
  Get,
  Query,
} from '@nestjs/common';
import { PulperiaService } from './pulperia.service';
import { JwtAuthGuard } from '../guard/auth.guard';
import { CreatePulperiaDto } from './dto/pulperia.dto';
import { PulperiaResDto } from './dto/pulperia.dto.res';

@Controller('pulperia')
export class PulperiaController {
  constructor(private readonly pulperiaService: PulperiaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createPulperia: CreatePulperiaDto) {
    try {
      const currentUser = req.user.id;

      return await this.pulperiaService.create({
        name: createPulperia.name,
        statusId: createPulperia.status,
        ownerId: createPulperia.owner ?? currentUser,
        creatorId: createPulperia.creator ?? currentUser,
        coordinates: {
          lat: createPulperia.coordinates[0],
          lng: createPulperia.coordinates[1],
        },
      });
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get('by-radius')
  async findByRadius(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
    @Query('status') status?: number,
  ) {
    try {
      return await this.pulperiaService.findLocationsWithinRadius(
        {
          lat,
          lng,
        },
        radius,
        status,
      );
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async myPulperia(@Request() req): Promise<PulperiaResDto[]> {
    try {
      return (await this.pulperiaService.findPulperiaByUser(req.user.id)).map(
        (pulperia) => ({
          id: pulperia.id,
          name: pulperia.name,
          status: pulperia.status,
        }),
      );
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }
}
