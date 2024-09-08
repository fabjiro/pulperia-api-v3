import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthReqDto {
  @IsNotEmpty({ message: 'El campo correo es requerido' })
  @IsEmail({}, { message: 'El correo no es valido' })
  email: string;

  @IsNotEmpty({ message: 'El campo password es requerido' })
  password: string;
}
