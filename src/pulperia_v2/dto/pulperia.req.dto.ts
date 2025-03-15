import { IsOptional } from 'class-validator';

export class PulperiaReqDto {
  id: number;

  @IsOptional()
  name?: string;

  @IsOptional()
  status?: number;
}
