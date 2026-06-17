import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { JsonStorageService } from '../../data/json-storage.service';
import { Equipe } from './equipe.interface';

@Injectable()
export class EquipesService {
  private file = path.join(process.cwd(), 'data/equipes.json');

  constructor(private storage: JsonStorageService<Equipe>) {}

  async findAll(): Promise<Equipe[]> {
    const data = await this.storage.read(this.file);

    return data.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    );
  }

  async findOne(id: number): Promise<Equipe> {
    const data = await this.findAll();

    const equipe = data.find(e => e.id === id);

    if (!equipe) {
      throw new NotFoundException('Équipe introuvable');
    }

    return equipe;
  }

  async create(dto: Partial<Equipe>): Promise<Equipe> {
    const data = await this.findAll();

    const newEquipe: Equipe = {
      id: data.length ? Math.max(...data.map(e => e.id)) + 1 : 1,

      nom: dto.nom!,
      poste: dto.poste,
      description: dto.description,
      photo: dto.photo,

      created_at: new Date().toISOString(),
    };

    data.push(newEquipe);

    await this.storage.write(this.file, data);

    return newEquipe;
  }

  async update(id: number, dto: Partial<Equipe>): Promise<Equipe> {
    const data = await this.findAll();

    const index = data.findIndex(e => e.id === id);

    if (index === -1) {
      throw new NotFoundException('Équipe introuvable');
    }

    data[index] = {
      ...data[index],
      ...dto,
    };

    await this.storage.write(this.file, data);

    return data[index];
  }

  async remove(id: number): Promise<void> {
    const data = await this.findAll();

    const filtered = data.filter(e => e.id !== id);

    if (filtered.length === data.length) {
      throw new NotFoundException('Équipe introuvable');
    }

    await this.storage.write(this.file, filtered);
  }
}