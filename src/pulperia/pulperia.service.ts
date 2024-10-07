import { Injectable } from '@nestjs/common';
import { Pulperia } from './entities/pulperia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPulperiaCreate } from './interface/pulperia.interface';
import { ICoordinates } from './interface/coordinates.interface';
import { UserService } from '../user/user.service';
import { STATUSENUM } from '../status/enum/status.enum';
import { StatusService } from '../status/status.service';

@Injectable()
export class PulperiaService {
  constructor(
    @InjectRepository(Pulperia)
    private readonly pulperiaRepository: Repository<Pulperia>,
    private readonly userService: UserService,
    private readonly statusService: StatusService,
  ) {}

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
      createPulperiaDto.statusId ?? STATUSENUM.REVIEW,
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

    return await this.pulperiaRepository.save(createdPulperia);
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

  async findById(id: number) {
    return await this.pulperiaRepository.findOne({ where: { id } });
  }
}
