import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './create-service.dto';
import { UpdateServiceDto } from './update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private repo: Repository<Service>,
  ) {}

  findAllActive() {
    return this.repo.find({
      where: { is_active: 1 },
      order: { created_at: 'DESC' },
    });
  }

  findAll() {
    return this.repo.find();
  }

  // create(fd: FormData) {
  //   return this.http.post(`${this.api}/services`, fd);
  // }

  create(data: CreateServiceDto) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: UpdateServiceDto) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
