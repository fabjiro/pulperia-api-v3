import { IsNotEmpty } from 'class-validator';

export class RolCreateDto {
  //   @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre es requerido' })
  name: string;
}
