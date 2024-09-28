import { Controller } from '@nestjs/common';
import { PulperiaService } from './pulperia.service';

@Controller('pulperia')
export class PulperiaController {
  constructor(private readonly pulperiaService: PulperiaService) {}
}
