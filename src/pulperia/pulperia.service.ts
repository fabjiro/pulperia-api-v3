import { Injectable } from '@nestjs/common';
import { Pulperia } from './entities/pulperia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPulperiaCreate } from './interface/pulperia.interface';
import { ICoordinates } from './interface/coordinates.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class PulperiaService {
  constructor(
    @InjectRepository(Pulperia)
    private readonly pulperiaRepository: Repository<Pulperia>,
    private readonly userService: UserService,
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

    const createdPulperia = this.pulperiaRepository.create({
      ...createPulperiaDto,
      owner,
      creator,
    });

    return await this.pulperiaRepository.save(createdPulperia);
  }

  async findLocationsWithinRadius(
    corrdinate: ICoordinates,
    radius: number = 5,
  ): Promise<Pulperia[]> {
    const { lat, lng } = corrdinate;
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
}
