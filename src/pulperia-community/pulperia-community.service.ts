import { Injectable } from '@nestjs/common';
import { PulperiaComunnity } from './entity/pulperia.community.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PulperiaCommunityService {
  constructor(
    @InjectRepository(PulperiaComunnity)
    private readonly pulperiacommunityRepository: Repository<PulperiaComunnity>,
  ) {}

  async getCountByPulperia(idPulperia: number) {
    const count = await this.pulperiacommunityRepository
      .createQueryBuilder('pulperiacommunity')
      .where('pulperiacommunity.pulperia_id = :idPulperia', { idPulperia })
      .getCount();
    return count;
  }

  async insertPulperiaCommunity(idPulperia: number, idUser: number) {
    const createdPulperiacommunity = this.pulperiacommunityRepository.create({
      pulperia_id: idPulperia,
      user_id: idUser,
    });
    return await this.pulperiacommunityRepository.save(
      createdPulperiacommunity,
    );
  }

  async checkExistUserPulperiacommunity(idPulperia: number, idUser: number) {
    const pulperiacommunity = await this.pulperiacommunityRepository.findOne({
      where: {
        pulperia_id: idPulperia,
        user_id: idUser,
      },
    });
    return !!pulperiacommunity;
  }

  async getByUserId(idUser: number) {
    return await this.pulperiacommunityRepository.find({
      where: { user_id: idUser },
      select: ['pulperia_id'],
      relations: ['pulperia', 'pulperia.status'],
    });
  }
}
