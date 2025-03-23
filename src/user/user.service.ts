import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolService } from '../rol/rol.service';
import { RolEnum } from '../rol/enum/RolEnum';
import { IUser, UserRegister } from './interface/user.interface';
import { ImageService } from '../image/image.service';
import { IMAGEENUM } from '../image/enum/image.enum';
import { IMAGECONST } from '../image/const/image.const';
import { EncryptionService } from '../utils/encrypt.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly rolService: RolService,
    private readonly imageService: ImageService,
    private readonly encriptService: EncryptionService,

    // private readonly uploaderService: UploaderService,
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

  async update(id: number, userData: Partial<IUser>) {
    const user = await this.userRepository.findOne({
      select: ['id', 'name', 'email', 'rol', 'avatar'],
      where: { id },
      relations: ['rol', 'avatar'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userData.name) {
      user.name = userData.name;
    }

    // if (userData.email) {
    //   user.email = userData.email;
    // }

    if (userData.password) {
      const hashedPassword = await this.encriptService.hashPassword(
        userData.password,
      );
      user.password = hashedPassword;
    }

    if (userData.rol) {
      if (user.rol.id !== userData.rol) {
        const rol = await this.rolService.findById(userData.rol);
        if (!rol) {
          throw new NotFoundException('Rol not found');
        }
        user.rol = rol;
      }
    }

    if (userData.avatar) {
      // const avatar = await this.imageService.findById(userData.avatar);
      const imageDb = await this.imageService.findById(user.avatar.id);
      if (!imageDb) {
        throw new Error('Image not found');
      }

      const newImage = await this.imageService.uploadFile(userData.avatar);
      user.avatar.id = newImage.id;

      await this.userRepository.save(user);

      if (imageDb.id !== IMAGECONST.USER) {
        await this.imageService.deleteById(imageDb.id);
      }
    }

    await this.userRepository.save(user);

    return user;
  }
}
