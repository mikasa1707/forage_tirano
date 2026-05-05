import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravauxService } from './travaux.service';
import { TravauxController } from './travaux.controller';
import { Travaux } from './entities/travaux.entities';
import { TravauxPhoto } from '../travaux/entities/travaux-photo.entity';
import { Equipe } from 'src/equipes/entities/equipe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Travaux, TravauxPhoto, Equipe]), // ✅ nécessaire
  ],
  providers: [TravauxService],
  controllers: [TravauxController],
})
export class TravauxModule {}
