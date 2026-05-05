import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { id: 'DESC' },
      select: ['id', 'username', 'role'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async create(data: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.usersRepository.findOne({
      where: { username: data.username },
    });

    if (existing) {
      throw new ConflictException('Nom d’utilisateur déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      username: data.username,
      password: hashedPassword,
      role: data.role,
    });

    const saved = await this.usersRepository.save(user);

    return {
      id: saved.id,
      username: saved.username,
      role: saved.role,
    } as Omit<User, 'password'>;
  }

  async update(
    id: number,
    data: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findOne(id);

    if (data.username && data.username !== user.username) {
      const existing = await this.usersRepository.findOne({
        where: { username: data.username },
      });

      if (existing) {
        throw new ConflictException('Nom d’utilisateur déjà utilisé');
      }
    }

    if (data.username !== undefined) {
      user.username = data.username;
    }

    if (data.role !== undefined) {
      user.role = data.role;
    }

    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    const saved = await this.usersRepository.save(user);

    return {
      id: saved.id,
      username: saved.username,
      role: saved.role,
    } as Omit<User, 'password'>;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Utilisateur introuvable');
    }
  }
}
