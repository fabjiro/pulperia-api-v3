import { Module } from '@nestjs/common';
import { UserInvitationService } from './user-invitation.service';
import { UserInvitationController } from './user-invitation.controller';
import { UserInvitation } from './entity/user.invitation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserInvitation])],
  controllers: [UserInvitationController],
  providers: [UserInvitationService],
  exports: [UserInvitationService],
})
export class UserInvitationModule {}
