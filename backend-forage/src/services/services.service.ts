import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './create-service.dto';
import { UpdateServiceDto } from './update-service.dto';
import { JsonStorageService } from '../json-storage.service';
import { Service } from './service.interface';
import * as path from 'path';

@Injectable()
export class ServicesService {
  private filePath = path.join(process.cwd(), 'data/services.json');

  constructor(private storage: JsonStorageService<Service>) {}

  async findAllActive() {
    const data = await this.storage.read(this.filePath);
    return data
      .filter(s => Number(s.is_active) === 1)
      .sort((a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
  }

  async findAll() {
    return this.storage.read(this.filePath);
  }

  async create(data: CreateServiceDto) {
    const list = await this.findAll();

    const newService: Service = {
      ...data,
      id: list.length ? Math.max(...list.map(i => i.id)) + 1 : 1,
      created_at: new Date().toISOString(),
      is_active: data.is_active ?? 1,
    };

    list.push(newService);
    await this.storage.write(this.filePath, list);

    return newService;
  }

  async update(id: number, data: UpdateServiceDto) {
    const list = await this.findAll();

    const index = list.findIndex(s => s.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...data,
    };

    await this.storage.write(this.filePath, list);

    return list[index];
  }

  async remove(id: number) {
    let list = await this.findAll();

    list = list.filter(s => s.id !== id);

    await this.storage.write(this.filePath, list);

    return { deleted: true };
  }
}