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
import { AuthLoginReqDto, AuthRefreshTokenReqDto } from './dto/auth.req.dto';
import { JwtAuthGuard } from '../guard/auth.guard';
import { RegisterUserDto } from '../user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() createAuthDto: AuthLoginReqDto) {
    try {
      return await this.authService.login(createAuthDto);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshToken: AuthRefreshTokenReqDto) {
    try {
      return this.authService.refreshToken(refreshToken.refreshToken);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Post('register')
  async register(@Body() createAuthDto: RegisterUserDto) {
    try {
      return await this.authService.registerUser(createAuthDto);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req) {
    try {
      return this.authService.me(req.user.id);
    } catch (error) {
      throw new NotFoundException(error.toString());
    }
  }
}
