import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Image is required' })
  image: string;

  @IsNotEmpty({ message: 'Category is required' })
  category: number;

  @IsOptional()
  status?: number;
}

export class UpdateProductDto {
  @IsOptional()
  name?: string;
  @IsOptional()
  image?: string;
  @IsOptional()
  category?: number;
  @IsOptional()
  status?: number;
}
