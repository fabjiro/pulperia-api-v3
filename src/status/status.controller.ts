import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guard/auth.guard';
import { StatusService } from './status.service';

@Controller('status')
@UseGuards(JwtAuthGuard)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  getAll() {
    return this.statusService.findAll();
  }
}
