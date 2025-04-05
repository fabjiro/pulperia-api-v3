import { Injectable } from '@nestjs/common';
import { Pulperia } from './entities/pulperia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
        createdAt: true,
        updatedAt: true,
        status: {
          id: true,
          name: true,
        },
        reviwer: {
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
        reviwer: {
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
  ) {
    const { lat, lng } = corrdinate;

    return await this.pulperiaRepository.query(
      `SELECT 
    *,
    ST_X(coordinates::geometry) AS latitude,
    ST_Y(coordinates::geometry) AS longitude
FROM 
    pulperia
WHERE 
    ST_DWithin(
        coordinates::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
    );`,
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

  async setReviewer(idPulperia: number, idUser: number) {
    const pulperia = await this.pulperiaRepository.findOne({
      where: { id: idPulperia },
      relations: ['reviwer', 'status'],
    });

    const user = await this.userService.findBydId(idUser);

    if (!pulperia) {
      throw new Error('Pulperia not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    if (pulperia.reviwer) {
      return await this.findById(idPulperia);
    }

    if (pulperia.status.id === STATUSENUM.REVIEW) {
      return await this.findById(idPulperia);
    }

    await this.pulperiaRepository.update(idPulperia, {
      reviwer: {
        id: idUser,
      },
      status: {
        id: STATUSENUM.REVIEW,
      },
    });

    return await this.findById(idPulperia);
  }

  async getMyReview(idUser: number) {
    const user = await this.userService.findBydId(idUser);

    if (!user) {
      throw new Error('User not found');
    }

    return await this.pulperiaRepository.find({
      where: { reviwer: { id: idUser } },
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
    });
  }

  // esta funcion es para caclular la distancia entre dos puntos
  haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    // Radio de la Tierra en metros
    const R = 6371000; // 6371.0 km * 1000 para convertir a metros

    // Convertir grados a radianes
    const lat1Rad = lat1 * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    const lon2Rad = lon2 * (Math.PI / 180);

    // Diferencias
    const dlat = lat2Rad - lat1Rad;
    const dlon = lon2Rad - lon1Rad;

    // Fórmula del haversine
    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));

    // Distancia en metros
    const distance = R * c;
    return distance;
  }
  decodeWKB(wkb) {
    const buffer = Buffer.from(wkb, 'hex');
    const geometryType = buffer.readUInt8(0);

    if (geometryType !== 1) {
      // 1 es para Point
      throw new Error('Solo se soportan puntos en este ejemplo.');
    }

    const isLittleEndian = buffer.readUInt8(1) === 0;
    const x = isLittleEndian ? buffer.readDoubleLE(2) : buffer.readDoubleBE(2);
    const y = isLittleEndian
      ? buffer.readDoubleLE(10)
      : buffer.readDoubleBE(10);

    return { latitude: y.toFixed(5), longitude: x.toFixed(5) };
  }

  getPulperiaByProductId(id: number | number[]) {
    if (Array.isArray(id)) {
      return this.pulperiaRepository.find({
        where: { id: In(id) },
      });
    }

    return this.pulperiaRepository.findOne({
      where: { id },
    });
  }
}
