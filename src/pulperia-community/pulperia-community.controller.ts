import { Controller } from '@nestjs/common';
import { PulperiaCommunityService } from './pulperia-community.service';

@Controller('pulperia-community')
export class PulperiaCommunityController {
  constructor(private readonly pulperiaCommunityService: PulperiaCommunityService) {}
}
