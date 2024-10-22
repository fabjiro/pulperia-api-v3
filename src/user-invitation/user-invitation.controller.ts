import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserInvitationService } from './user-invitation.service';
import { UserInvitationCreateDto } from './dto/user.invitation.create.dto';

@Controller('invitation')
export class UserInvitationController {
  constructor(private readonly userInvitationService: UserInvitationService) {}

  @Post()
  async sendInvitation(@Body() userData: UserInvitationCreateDto) {
    const { email, firstName, lastName } = userData;

    const exist = await this.userInvitationService.findIsExitsEmail(email);

    if (exist) {
      throw new HttpException(
        'El email ya esta registrado',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    return await this.userInvitationService.save({
      email,
      firstName,
      lastName,
    });
  }
}
