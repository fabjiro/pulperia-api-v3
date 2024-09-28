import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { PulperiaService } from './pulperia.service';
import { JwtAuthGuard } from '../guard/auth.guard';
import { Roles } from '../rol/decorators/rols.decorator';
import { RolEnum } from '../rol/enum/RolEnum';
import { RolesGuard } from '../rol/guards/role.guard';
import { CreatePulperiaDto } from './dto/pulperia.dto';

@Controller('pulperia')
@UseGuards(JwtAuthGuard)
export class PulperiaController {
  constructor(private readonly pulperiaService: PulperiaService) {}
  @Post()
  @Roles(RolEnum.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Request() req, @Body() createPulperia: CreatePulperiaDto) {
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
  }
}
