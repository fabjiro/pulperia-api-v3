import { PartialType } from '@nestjs/mapped-types';
import { CreatePulperiaV2Dto } from './create-pulperia_v2.dto';

export class UpdatePulperiaV2Dto extends PartialType(CreatePulperiaV2Dto) {}
