import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthLoginReqDto {
  @IsNotEmpty({ message: 'El campo correo es requerido' })
  @IsEmail({}, { message: 'El correo no es valido' })
  email: string;

  @IsNotEmpty({ message: 'El campo password es requerido' })
  password: string;
}

export class AuthRefreshTokenReqDto {
  @IsNotEmpty({ message: 'El campo refreshToken es requerido' })
  refreshToken: string;
}
