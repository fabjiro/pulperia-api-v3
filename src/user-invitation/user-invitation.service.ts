import { Injectable } from '@nestjs/common';
import { UserInvitation } from './entity/user.invitation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserInvitation } from './interface/IUserInvitation';

@Injectable()
export class UserInvitationService {
  constructor(
    @InjectRepository(UserInvitation)
    private readonly userInvitationRepository: Repository<UserInvitation>,
  ) {}

  async findIsExitsEmail(email: string) {
    return await this.userInvitationRepository.exists({ where: { email } });
  }

  async save(userData: IUserInvitation) {
    const userInvitation = this.userInvitationRepository.create(userData);
    return await this.userInvitationRepository.save(userInvitation);
  }
}
