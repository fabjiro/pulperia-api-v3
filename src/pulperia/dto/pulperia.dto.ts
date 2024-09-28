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

  @IsArray({ message: 'Corrdenadas deben ser arreglos' })
  @IsNotEmpty({ message: 'Corrdenadas son requeridas' })
  @IsNumber({}, { each: true, message: 'Corrdenadas deben ser numericas' })
  coordinates: [number, number]; // [longitude, latitude]
}
