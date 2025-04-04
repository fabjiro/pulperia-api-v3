import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  NotFoundException,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { PulperiaService } from './pulperia.service';
import { JwtAuthGuard } from '../guard/auth.guard';
import {
  CreateCommunityPulperiaDto,
  CreatePulperiaDto,
} from './dto/pulperia.dto';
import { PulperiaResDto } from './dto/pulperia.dto.res';
import { StatusService } from '../status/status.service';
import { STATUSENUM } from '../status/enum/status.enum';
import { UserService } from '../user/user.service';
import { UserEnum } from '../enums/user.enum';
import { PulperiaCommunityService } from '../pulperia-community/pulperia-community.service';
import { Roles } from '../rol/decorators/rols.decorator';
import { RolEnum } from '../rol/enum/RolEnum';
import { RolesGuard } from '../rol/guards/role.guard';
// import { PulperiaCategoryService } from '../pulperia-category/pulperia-category.service';

@Controller('pulperia')
export class PulperiaController {
  constructor(
    private readonly pulperiaService: PulperiaService,
    private readonly statusService: StatusService,
    private readonly userService: UserService,
    private readonly pulperiaCommunityService: PulperiaCommunityService,
  ) {}

  @Get('reviewes')
  @UseGuards(JwtAuthGuard)
  async findReviewes(@Request() req) {
    try {
      const userId = req.user.id;
      return await this.pulperiaService.getMyReview(userId);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Post('reviewer/:id')
  @UseGuards(JwtAuthGuard)
  async setReviewer(@Param('id') id: number, @Request() req) {
    try {
      const userId = req.user.id;
      return await this.pulperiaService.setReviewer(id, userId);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa los guards en cadena
  @Roles(RolEnum.ADMIN) // Este decorador asigna el rol
  async findAll() {
    try {
      return await this.pulperiaService.all();
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

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
        inventory: createPulperia.inventory,
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
  @UseGuards(JwtAuthGuard)
  async findByRadius(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
    @Query('status') status?: number,
    @Query('product') product?: number[],
  ) {
    try {
      // se comenzara a procesar data desde el codigo
      let response = await this.pulperiaService.findLocationsWithinRadius(
        {
          lat,
          lng,
        },
        radius,
      );

      for (const pulperia of response) {
        pulperia.coordinates = {
          lat: pulperia.latitude,
          lng: pulperia.longitude,
        };
      }

      // si tiene status lo filtramos por ese status
      if (status) {
        response = response.filter(
          (pulperia: any) => Number(pulperia.statusId) === Number(status),
        );
      }

      if (product) {
        // primero vamos a buscar los productos
        const pulperiaByProducts =
          await this.pulperiaService.getPulperiaByProductId(product);

        if (Array.isArray(pulperiaByProducts)) {
          const pulperiaIds = pulperiaByProducts.map((pulperia) => pulperia.id);

          response = response.filter(
            (pulperia: any) =>
              pulperiaIds.includes(pulperia.id) ||
              pulperia.creatorId === UserEnum.CREATOR ||
              pulperia.creatorId === UserEnum.COMMUNITY,
          );
        }
      }

      return response.map((pulperia: any) => ({
        id: pulperia.id,
        name: pulperia.name,
        coordinates: pulperia.coordinates,
        createdById: pulperia.creatorId,
        distance: this.pulperiaService.haversine(
          lat,
          lng,
          pulperia.coordinates.lat,
          pulperia.coordinates.lng,
        ),
      }));
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get('by-product')
  @UseGuards(JwtAuthGuard)
  async findByProduct(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('productId') productIds: number[],
    @Query('radius') radius?: number,
    @Query('status') status?: number,
  ) {
    try {
      const reponse =
        await this.pulperiaService.findPulperiaByProductsAndLocation(
          {
            lat,
            lng,
          },
          productIds,
          radius,
          status,
        );

      const resultStatus = await this.statusService.findOne(
        status ?? STATUSENUM.REVIEW,
      );

      return reponse.map((pulperia) => ({
        id: pulperia.id,
        name: pulperia.name,
        status: resultStatus,
        distance: pulperia.distance,
        createdById: pulperia.creatorId,
        coordinates: {
          lat: pulperia.latitude,
          lng: pulperia.longitude,
        },
      }));
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

  @Get('categories')
  async getCategories(
    @Query('pulperia') pulperia: number,
    @Query('status') status?: number,
  ) {
    try {
      return await this.pulperiaService.getCategoryById(pulperia, status);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get('community/me')
  @UseGuards(JwtAuthGuard)
  async myCommunity(@Request() req) {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new NotFoundException('User id required');
      }

      const user = await this.userService.findBydId(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const myCommunity = await this.pulperiaCommunityService.getByUserId(
        user.id,
      );

      return myCommunity.map((e) => ({
        id: e.pulperia.id,
        name: e.pulperia.name,
        status: e.pulperia.status,
      }));
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Post('community')
  @UseGuards(JwtAuthGuard)
  async community(
    @Request() req,
    @Body() createPulperia: CreateCommunityPulperiaDto,
  ) {
    try {
      const userId = req.user.id;
      const { coordinates } = createPulperia;

      if (!userId) {
        throw new NotFoundException('User id required');
      }

      const user = this.userService.findBydId(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const pulperiasByRadius =
        (await this.pulperiaService.findLocationsWithinRadius(
          {
            lat: coordinates[0],
            lng: coordinates[1],
          },
          0.5,
        )) as any[];

      if (pulperiasByRadius.length === 0) {
        const randomNumber = Math.floor(Math.random() * 1000);

        const newPulperia = await this.pulperiaService.create({
          coordinates: {
            lat: coordinates[0],
            lng: coordinates[1],
          },
          name: `Pulperia_p${randomNumber}`,
          creatorId: UserEnum.COMMUNITY,
          ownerId: UserEnum.COMMUNITY,
        });

        await this.pulperiaCommunityService.insertPulperiaCommunity(
          newPulperia.id,
          userId,
        );

        return newPulperia;
      }

      const pulperia = pulperiasByRadius[0];

      if ((pulperia.statusId as number) === STATUSENUM.ACTIVE) {
        throw new NotFoundException(
          'This pulperia is already active, please try another one',
        );
      }

      const check =
        await this.pulperiaCommunityService.checkExistUserPulperiacommunity(
          pulperia.id,
          userId,
        );
      if (check) {
        throw new NotFoundException(
          'You are already in this pulperia community',
        );
      }

      await this.pulperiaCommunityService.insertPulperiaCommunity(
        pulperia.id,
        userId,
      );

      const count = await this.pulperiaCommunityService.getCountByPulperia(
        pulperia.id,
      );

      if (count >= 3) {
        await this.pulperiaService.update(
          {
            statusId: STATUSENUM.ACTIVE,
          },
          pulperia.id,
        );
      }

      return pulperia;
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPulperiaById(
    // @Param('id') id: number,
    @Param('id') id: number,
  ): Promise<PulperiaResDto> {
    try {
      const pulperia = await this.pulperiaService.findById(id);
      return pulperia;
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }
}
