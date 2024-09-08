import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from '../user/dto/user.dto';
import { IAuthRes } from './dto/auth.res.dto';
import { EncryptionService } from '../utils/encrypt.utils';
import { AuthLoginReqDto } from './dto/auth.req.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly encriptService: EncryptionService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(userData: RegisterUserDto): Promise<IAuthRes> {
    const existEmailt = await this.userService.findByEmail(userData.email);

    if (existEmailt) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await this.encriptService.hashPassword(
      userData.password,
    );

    const newUser = await this.userService.add({
      ...userData,
      password: hashedPassword,
    });

    const tokens = this.generateToken(newUser.id);

    return {
      user: newUser.name,
      ...tokens,
    };
  }

  async login(userData: AuthLoginReqDto): Promise<IAuthRes> {
    const userByEmail = await this.userService.findByEmail(userData.email);

    if (!userByEmail) {
      throw new Error('Usuario o contraseña son incorrectos');
    }

    const checkPassword = await this.encriptService.comparePasswords(
      userData.password,
      userByEmail.password,
    );

    if (!checkPassword) {
      throw new Error('Usuario o contraseña son incorrectos');
    }

    // generate token
    const tokens = this.generateToken(userByEmail.id);

    return {
      user: userByEmail.name,
      ...tokens,
    };
  }

  async me(id: number) {
    const user = await this.userService.findBydId(id);

    return {
      name: user.name,
    };
  }

  async validateProfile(id: number): Promise<boolean> {
    const user = await this.userService.findBydId(id);
    return !!user;
  }

  generateToken(id: number) {
    // generate token
    const token = this.jwtService.sign(
      {
        id,
      },
      {
        expiresIn: '1d',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        id,
      },
      {
        expiresIn: '31d',
      },
    );

    return {
      token,
      refreshToken,
    };
  }
}
