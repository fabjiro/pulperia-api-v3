import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthReqDto } from './dto/auth.req.dto';
import { JwtAuthGuard } from '../guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() createAuthDto: AuthReqDto) {
    try {
      return await this.authService.login(createAuthDto);
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req) {
    try {
      return this.authService.me(req.user.id);
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
