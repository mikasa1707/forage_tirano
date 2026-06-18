import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as path from 'path';

import { JsonStorageService } from '../json-storage.service';
import { Role, User } from './user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private file = path.join(process.cwd(), 'data/users.json');

  constructor(private storage: JsonStorageService<User>) { }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const data = await this.storage.read(this.file);

    return data
      .sort((a, b) => b.id - a.id)
      .map(({ password, ...user }) => user);
  }

  async findOne(id: number): Promise<User> {
    const data = await this.storage.read(this.file);

    const user = data.find(u => u.id === id);

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const data = await this.storage.read(this.file);

    return data.find(u => u.username === username) || null;
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const data = await this.storage.read(this.file);

    const existing = data.find(u => u.username === dto.username);

    if (existing) {
      throw new ConflictException('Nom d’utilisateur déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const _role: Role = (dto.role as Role) ?? 'admin';

    const newUser: User = {
      id: data.length ? Math.max(...data.map(u => u.id)) + 1 : 1,
      username: dto.username,
      password: hashedPassword,
      role: _role,
      created_at: new Date().toISOString(),
    };

    data.push(newUser);

    await this.storage.write(this.file, data);

    const { password, ...result } = newUser;
    return result;
  }

  async update(id: number, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const data = await this.storage.read(this.file);

    const index = data.findIndex(u => u.id === id);

    if (index === -1) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const user = data[index];

    // username check
    if (dto.username && dto.username !== user.username) {
      const exists = data.find(u => u.username === dto.username);
      if (exists) {
        throw new ConflictException('Nom d’utilisateur déjà utilisé');
      }
      user.username = dto.username;
    }

    if (dto.role !== undefined) {
      user.role = dto.role as Role;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    data[index] = user;

    await this.storage.write(this.file, data);

    const { password, ...result } = user;
    return result;
  }

  async remove(id: number): Promise<void> {
    const data = await this.storage.read(this.file);

    const filtered = data.filter(u => u.id !== id);

    if (filtered.length === data.length) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    await this.storage.write(this.file, filtered);
  }
}