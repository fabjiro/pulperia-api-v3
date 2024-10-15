import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

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

  @IsArray({ message: 'El inventario debe ser un arreglo' })
  @ValidateNested({ each: true }) // Valida cada item de inventario dentro del array
  @Type(() => InventoryItemDto) // Convierte los elementos del array en instancias de InventoryItemDto
  inventory: InventoryItemDto[];
}

export class InventoryItemDto {
  @IsNotEmpty({ message: 'El ID de la categoría es requerido' })
  categoryId: number;

  @IsArray({ message: 'Los productos deben ser un arreglo' })
  @IsNotEmpty({ message: 'Los productos son requeridos' })
  @IsNumber({}, { each: true, message: 'Los productos deben ser numericos' })
  products: number[];
}

export class CreateCommunityPulperiaDto {
  @IsArray({ message: 'coordinates deben ser arreglos' })
  @IsNotEmpty({ message: 'coordinates son requeridas' })
  @IsNumber({}, { each: true, message: 'coordinates deben ser numericas' })
  coordinates: [number, number]; // [longitude, latitude]
}
