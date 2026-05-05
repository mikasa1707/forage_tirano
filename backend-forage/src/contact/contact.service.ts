import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private repo: Repository<Contact>,
  ) {}

  async create(data: CreateContactDto) {
    if (!data.email || !data.message || !data.nom) {
      throw new BadRequestException('Champs manquants');
    }

    const contact = this.repo.create({
      ...data,
      status: 'nouveau',
    });

    return this.repo.save(contact);
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const contact = await this.repo.findOneBy({ id });

    if (!contact) {
      throw new NotFoundException('Message introuvable');
    }

    return contact;
  }

  async markAsRead(id: number) {
    const contact = await this.findOne(id);
    contact.status = 'lu';
    return this.repo.save(contact);
  }

  async markAsUnread(id: number) {
    const contact = await this.findOne(id);
    contact.status = 'nouveau';
    return this.repo.save(contact);
  }

  async remove(id: number) {
    const contact = await this.findOne(id);
    return this.repo.remove(contact);
  }
}
