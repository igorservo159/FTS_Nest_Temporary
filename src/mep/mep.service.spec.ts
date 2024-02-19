import { Test, TestingModule } from '@nestjs/testing';
import { MepService } from './mep.service';

describe('MepService', () => {
  let service: MepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MepService],
    }).compile();

    service = module.get<MepService>(MepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
