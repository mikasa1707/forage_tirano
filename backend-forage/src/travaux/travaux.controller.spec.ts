import { Test, TestingModule } from '@nestjs/testing';
import { TravauxController } from './travaux.controller';

describe('TravauxController', () => {
  let controller: TravauxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TravauxController],
    }).compile();

    controller = module.get<TravauxController>(TravauxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
