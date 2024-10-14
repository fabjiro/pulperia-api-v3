import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePulperiaDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  status?: number;

  @IsOptional()
  owner?: number;

  @IsOptional()
  creator?: number;

  @IsArray({ message: 'coordinates deben ser arreglos' })
  @IsNotEmpty({ message: 'coordinates son requeridas' })
  @IsNumber({}, { each: true, message: 'coordinates deben ser numericas' })
  coordinates: [number, number]; // [longitude, latitude]
}

export class CreateCommunityPulperiaDto {
  @IsArray({ message: 'coordinates deben ser arreglos' })
  @IsNotEmpty({ message: 'coordinates son requeridas' })
  @IsNumber({}, { each: true, message: 'coordinates deben ser numericas' })
  coordinates: [number, number]; // [longitude, latitude]
}
