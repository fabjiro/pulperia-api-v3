import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // get all controller
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(@Query('rol') rol: number) {
    return await this.userService.getAll(rol);
  }

  // update user
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: number, @Body() data: UpdateUserDto) {
    return await this.userService.update(id, data);
  }

  //   update avatar user
  @Put(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file')) // 'file' debe coincidir con el nombre del campo en el formulario
  async updateAvatar(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.update(id, {
      avatar: file,
    });
  }
}
