import { Injectable } from '@nestjs/common';
import { Pulperia } from './entities/pulperia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPulperiaCreate,
  IPulperiaUpdate,
} from './interface/pulperia.interface';
import { ICoordinates } from './interface/coordinates.interface';
import { UserService } from '../user/user.service';
import { STATUSENUM } from '../status/enum/status.enum';
import { StatusService } from '../status/status.service';
import { PulperiaCategoryService } from '../pulperia-category/pulperia-category.service';
import { PulperiaProductService } from '../pulperia-product/pulperia-product.service';
import { UserEnum } from '../enums/user.enum';

@Injectable()
export class PulperiaService {
  constructor(
    @InjectRepository(Pulperia)
    private readonly pulperiaRepository: Repository<Pulperia>,
    private readonly userService: UserService,
    private readonly statusService: StatusService,
    private readonly pulperiaCategoryService: PulperiaCategoryService,
    private readonly pulperiaProductService: PulperiaProductService,
  ) {}

  async all() {
    return await this.pulperiaRepository.find({
      select: {
        id: true,
        name: true,
        coordinates: true,
        createdAt: true,
        updatedAt: true,
        status: {
          id: true,
          name: true,
        },
        owner: {
          id: true,
          name: true,
          avatar: {
            min_link: true,
            original_link: true,
          },
        },
        creator: {
          id: true,
          name: true,
          avatar: {
            min_link: true,
            original_link: true,
          },
        },
      },
      relations: {
        status: true,
        owner: {
          avatar: true,
        },
        creator: {
          avatar: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findPulperiaByProductsAndLocation(
    corrdinate: ICoordinates,
    products: number[],
    radius: number = 5,
    status?: number,
  ) {
    const { lat, lng } = corrdinate;
    const pulperiasId = (
      await this.pulperiaProductService.getPulperiaByProductsId(products)
    ).map((e) => e.pulperia_id);

    const pulperiaAviable = await this.pulperiaRepository.query(
      `SELECT *,
              ST_X(coordinates::geometry) AS latitude,
            ST_Y(coordinates::geometry) AS longitude,
            ST_Distance(
              coordinates::geography,
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
            ) AS distance
        FROM pulperia
        WHERE ST_DWithin(
              coordinates::geography,
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
              $3
            )
              AND (
                "statusId" = $4
                AND "id" = ANY($5)
                OR "creatorId" = ANY($6)
              )
        ORDER BY distance;
        `,
      [
        lat,
        lng,
        radius,
        status,
        pulperiasId,
        [UserEnum.COMMUNITY, UserEnum.CREATOR],
      ],
    );

    return pulperiaAviable;
  }

  async create(createPulperiaDto: IPulperiaCreate) {
    const pulperiaOnRadius = await this.findLocationsWithinRadius(
      createPulperiaDto.coordinates,
      1,
    );

    if (pulperiaOnRadius.length > 0) {
      throw new Error('Pulperia already exists');
    }

    const owner = await this.userService.findBydId(createPulperiaDto.ownerId);
    if (!owner) {
      throw new Error('Owner not found');
    }

    const creator = await this.userService.findBydId(
      createPulperiaDto.creatorId,
    );
    if (!creator) {
      throw new Error('Creator not found');
    }

    const status = await this.statusService.findOne(
      createPulperiaDto.statusId ?? STATUSENUM.PENDING,
    );
    if (!status) {
      throw new Error('Status not found');
    }

    const createdPulperia = this.pulperiaRepository.create({
      ...createPulperiaDto,
      coordinates: {
        type: 'Point',
        coordinates: [
          createPulperiaDto.coordinates.lat,
          createPulperiaDto.coordinates.lng,
        ],
      },
      status,
      owner,
      creator,
    });

    const newPulperia = await this.pulperiaRepository.save(createdPulperia);

    if (createPulperiaDto.inventory) {
      const categoriesToAdd = createPulperiaDto.inventory.map(
        (item) => item.categoryId,
      );

      await Promise.all(
        categoriesToAdd.map((categoryId) => {
          return this.pulperiaCategoryService.addCategoryToPulperia(
            newPulperia.id,
            categoryId,
          );
        }),
      );

      for (const item of createPulperiaDto.inventory) {
        await Promise.all(
          item.products.map((productId) => {
            return this.pulperiaProductService.addPulperiaProduct(
              newPulperia.id,
              productId,
            );
          }),
        );
      }
    }
    const { id, name } = newPulperia;
    return {
      id,
      name,
    };
  }

  async update(updatePulperiaDto: IPulperiaUpdate, id: number) {
    const pulperia = await this.findById(id);
    const { statusId, creatorId, name, ownerId } = updatePulperiaDto;
    if (!pulperia) {
      throw new Error('Pulperia not found');
    }

    if (statusId) {
      const status = await this.statusService.findOne(
        updatePulperiaDto.statusId ?? STATUSENUM.REVIEW,
      );
      if (!status) {
        throw new Error('Status not found');
      }
    }

    if (ownerId) {
      const owner = await this.userService.findBydId(ownerId);
      if (!owner) {
        throw new Error('Owner not found');
      }
    }

    if (creatorId) {
      const creator = await this.userService.findBydId(creatorId);
      if (!creator) {
        throw new Error('Creator not found');
      }
    }

    await this.pulperiaRepository.update(id, {
      ...(statusId && {
        status: {
          id: statusId,
        },
      }),
      ...(ownerId && {
        owner: {
          id: ownerId,
        },
      }),
      ...(creatorId && {
        creator: {
          id: creatorId,
        },
      }),
      ...(name && { name }),
    });
  }

  async findLocationsWithinRadius(
    corrdinate: ICoordinates,
    radius: number = 5,
    status?: number,
  ) {
    const { lat, lng } = corrdinate;

    if (status) {
      const statusByid = await this.statusService.findOne(status);

      if (!statusByid) {
        throw new Error('Status not found');
      }

      return await this.pulperiaRepository.query(
        `SELECT *,
        ST_X(coordinates::geometry) AS latitude,
       ST_Y(coordinates::geometry) AS longitude,
       ST_Distance(
         coordinates::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
       ) AS distance
FROM pulperia
WHERE ST_DWithin(
        coordinates::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
  AND "statusId" = $4
ORDER BY distance;
`,
        [lat, lng, radius, status],
      );
    }

    return await this.pulperiaRepository.query(
      `SELECT * FROM pulperia
         WHERE ST_DWithin(
           coordinates::geography,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           $3
         )`,
      [lat, lng, radius], // Recuerda: [longitud, latitud]
    );
  }

  async findPulperiaByUser(idUser: number) {
    const user = await this.userService.findBydId(idUser);
    if (!user) {
      throw new Error('User not found');
    }
    return await this.pulperiaRepository.find({
      where: { owner: { id: idUser } },
      relations: ['status'],
    });
  }

  async checkPulperiaId(id: number) {
    return await this.pulperiaRepository.exists({
      where: { id },
    });
  }

  async findById(id: number) {
    return await this.pulperiaRepository.findOne({ where: { id } });
  }

  async getCategoryById(id: number, idStatus?: number) {
    const existePulperia = await this.checkPulperiaId(id);
    if (!existePulperia) {
      throw new Error('Pulperia not found');
    }

    const status = await this.statusService.checkStatusId(
      idStatus ?? STATUSENUM.ACTIVE,
    );
    if (!status) {
      throw new Error('Status not found');
    }

    return (
      await this.pulperiaCategoryService.getCategoriesByPulperia(id, idStatus)
    ).map((el) => el.categorie);
  }
}
