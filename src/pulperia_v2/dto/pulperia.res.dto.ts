import { Exclude } from 'class-transformer';

export class UserResDto {
  id: number;
  name: string;
  email: string;

  @Exclude() // Esto excluye la propiedad 'password' de la transformación
  password: string;

  avatar: {
    id: number;
    original_link: string;
    min_link: string;
  };
}
