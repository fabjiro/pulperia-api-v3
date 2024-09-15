import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  status?: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  status?: number;
}
