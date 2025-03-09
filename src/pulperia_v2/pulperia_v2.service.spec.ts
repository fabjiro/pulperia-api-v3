import { Test, TestingModule } from '@nestjs/testing';
import { PulperiaV2Service } from './pulperia_v2.service';

describe('PulperiaV2Service', () => {
  let service: PulperiaV2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PulperiaV2Service],
    }).compile();

    service = module.get<PulperiaV2Service>(PulperiaV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
