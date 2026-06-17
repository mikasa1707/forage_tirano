import { Module } from '@nestjs/common';
import { EquipesService } from './equipes.service';
import { EquipesController } from './equipes.controller';
import { StorageModule } from 'data/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [EquipesController],
  providers: [EquipesService],
})
export class EquipesModule {}
