import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class JsonStorageService<T> {
  async read(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      return [];
    }
  }

  async write(filePath: string, data: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}