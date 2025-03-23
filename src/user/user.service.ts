import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolService } from '../rol/rol.service';
import { RolEnum } from '../rol/enum/RolEnum';
import { UserRegister } from './interface/user.interface';
import { ImageService } from '../image/image.service';
import { IMAGEENUM } from '../image/enum/image.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly rolService: RolService,
    private readonly imageService: ImageService,
  ) {}

  async add(userData: UserRegister) {
    const defaultRol = await this.rolService.findById(
      userData.rol ?? RolEnum.USER,
    );

    const avatar = await this.imageService.findById(
      userData.avatar ?? IMAGEENUM.DEFAULTUSER,
    );

    const newUser = this.userRepository.create({
      ...userData,
      avatar,
      rol: defaultRol,
    });

    return await this.userRepository.save(newUser);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['rol', 'avatar'],
    });
  }

  async findBydId(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['rol', 'avatar'],
    });
  }

  async getAll(rol?: number) {
    return await this.userRepository.find({
      select: ['id', 'name', 'email', 'rol', 'avatar'],
      where: {
        rol: {
          id: rol,
        },
      },
      relations: ['rol', 'avatar'],
    });
  }
}
