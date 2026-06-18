import { Module } from '@nestjs/common';
import { TravauxService } from './travaux.service';
import { TravauxController } from './travaux.controller';
import { StorageModule } from 'src/storage.module';

@Module({
  imports: [StorageModule],
  providers: [TravauxService],
  controllers: [TravauxController],
})
export class TravauxModule {}
