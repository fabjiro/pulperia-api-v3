import { StatusResDto } from '../../status/dto/status.dto';

export interface PulperiaResDto {
  id: number;
  name: string;
  status: StatusResDto;
}
