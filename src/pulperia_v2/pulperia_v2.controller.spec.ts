import { Test, TestingModule } from '@nestjs/testing';
import { PulperiaV2Controller } from './pulperia_v2.controller';
import { PulperiaV2Service } from './pulperia_v2.service';

describe('PulperiaV2Controller', () => {
  let controller: PulperiaV2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PulperiaV2Controller],
      providers: [PulperiaV2Service],
    }).compile();

    controller = module.get<PulperiaV2Controller>(PulperiaV2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
