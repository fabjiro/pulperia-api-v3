import { Injectable } from '@nestjs/common';
import { Rol } from './entity/rol.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolCreateDto } from './dto/rol.dto';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol) private readonly rolRepository: Repository<Rol>,
  ) {}

  create(createRolDto: RolCreateDto) {
    return this.rolRepository.save({
      name: createRolDto.name,
    });
  }

  findById(id: number) {
    return this.rolRepository.findOne({ where: { id } });
  }
}
