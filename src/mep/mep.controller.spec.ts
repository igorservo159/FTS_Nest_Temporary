import { Test, TestingModule } from '@nestjs/testing';
import { MepController } from './mep.controller';
import { MepService } from './mep.service';

describe('MepController', () => {
  let controller: MepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MepController],
      providers: [MepService],
    }).compile();

    controller = module.get<MepController>(MepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
