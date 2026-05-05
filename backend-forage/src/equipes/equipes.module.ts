import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipesService } from './equipes.service';
import { EquipesController } from './equipes.controller';
import { Equipe } from './entities/equipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipe])],
  controllers: [EquipesController],
  providers: [EquipesService],
})
export class EquipesModule {}
