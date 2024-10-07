import { Controller } from '@nestjs/common';
import { PulperiaCategoryService } from './pulperia-category.service';

@Controller('pulperia-category')
export class PulperiaCategoryController {
  constructor(private readonly pulperiaCategoryService: PulperiaCategoryService) {}
}
