import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from '../user/dto/user.dto';
import { IAuthRes } from './dto/auth.res.dto';
import { EncryptionService } from '../utils/encrypt.utils';
import { AuthLoginReqDto } from './dto/auth.req.dto';
import { JwtService } from '@nestjs/jwt';
import { ImageService } from '../image/image.service';
import { IMAGEENUM } from '../image/enum/image.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly encriptService: EncryptionService,
    private readonly jwtService: JwtService,
    private readonly imageService: ImageService,
  ) {}

  async registerUser(userData: RegisterUserDto): Promise<IAuthRes> {
    const existEmailt = await this.userService.findByEmail(userData.email);

    if (existEmailt) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await this.encriptService.hashPassword(
      userData.password,
    );

    // const avatar = await this.imageService.create(userData.avatar);
    const avatarLocal = await this.imageService.findById(IMAGEENUM.DEFAULTUSER);

    const newUser = await this.userService.add({
      email: userData.email,
      name: userData.name,
      avatar: IMAGEENUM.DEFAULTUSER,
      password: hashedPassword,
    });

    const tokens = this.generateToken(newUser.id);

    return {
      user: {
        name: newUser.name,
        avatar: {
          original_link: avatarLocal.original_link,
          min_link: avatarLocal.min_link,
        },
      },
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
      user: {
        name: userByEmail.name,
        avatar: {
          original_link: userByEmail.avatar.original_link,
          min_link: userByEmail.avatar.min_link,
        },
      },
      ...tokens,
    };
  }

  async refreshToken(token: string): Promise<IAuthRes> {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    if (!payload) {
      throw new Error('Invalid token');
    }

    const user = await this.userService.findBydId(payload.id);

    if (!user) {
      throw new Error('User not found');
    }

    // generate token
    const tokens = this.generateToken(user.id);

    return {
      user: {
        name: user.name,
        avatar: {
          original_link: user.avatar.original_link,
          min_link: user.avatar.min_link,
        },
      },
      ...tokens,
    };
  }

  async me(id: number) {
    const user = await this.userService.findBydId(id);

    return {
      name: user.name,
      avatar: {
        original_link: user.avatar?.original_link ?? '',
        min_link: user.avatar?.min_link ?? '',
      },
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
