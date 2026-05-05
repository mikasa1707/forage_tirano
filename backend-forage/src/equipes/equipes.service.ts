import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipe } from './entities/equipe.entity';

@Injectable()
export class EquipesService {
  constructor(
    @InjectRepository(Equipe)
    private readonly equipeRepository: Repository<Equipe>,
  ) {}

  async create(data: Partial<Equipe>): Promise<Equipe> {
    const equipe = this.equipeRepository.create(data);
    return this.equipeRepository.save(equipe);
  }

  async findAll(): Promise<Equipe[]> {
    return this.equipeRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Equipe> {
    const equipe = await this.equipeRepository.findOne({ where: { id } });
    if (!equipe) throw new NotFoundException('Équipe introuvable');
    return equipe;
  }

  async update(id: number, data: Partial<Equipe>): Promise<Equipe> {
    const equipe = await this.findOne(id);
    Object.assign(equipe, data);
    return this.equipeRepository.save(equipe);
  }

  async remove(id: number): Promise<void> {
    const result = await this.equipeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Équipe introuvable');
    }
  }
}
