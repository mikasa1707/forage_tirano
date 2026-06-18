import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { StorageModule } from 'src/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
