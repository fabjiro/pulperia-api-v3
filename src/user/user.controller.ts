import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../guard/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // get all controller
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(@Query('rol') rol: number) {
    return await this.userService.getAll(rol);
  }
}
