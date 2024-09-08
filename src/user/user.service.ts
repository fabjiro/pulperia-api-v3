import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/user.dto';
import { RolService } from '../rol/rol.service';
import { Rol } from '../rol/entity/rol.entity';
import { RolEnum } from '../rol/enum/RolEnum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly rolService: RolService,
  ) {}

  async add(userData: RegisterUserDto, rol?: Rol) {
    const defaultRol = rol ?? (await this.rolService.findById(RolEnum.USER));

    const newUser = this.userRepository.create({
      ...userData,
      rol: defaultRol,
    });

    return await this.userRepository.save(newUser);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findBydId(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }
}
