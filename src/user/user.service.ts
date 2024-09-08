import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../utils/encrypt.utils';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/user.dto';
import { RolService } from '../rol/rol.service';
import { Rol } from '../rol/entity/rol.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly rolService: RolService,
    private readonly encriptService: EncryptionService,
  ) {}

  async register(userData: RegisterUserDto, rol?: Rol) {
    const hashedPassword = await this.encriptService.hashPassword(
      userData.password,
    );

    const defaultRol = rol ?? (await this.rolService.findById(0));

    const newUser = this.userRepository.create({
      ...userData,
      rol: defaultRol,
      password: hashedPassword,
    });

    return await this.userRepository.save(newUser);
  }

  async fingByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
}
