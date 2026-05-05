import { Test, TestingModule } from '@nestjs/testing';
import { TravauxService } from './travaux.service';

describe('TravauxService', () => {
  let service: TravauxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TravauxService],
    }).compile();

    service = module.get<TravauxService>(TravauxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
