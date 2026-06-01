import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { MessageGateway } from './message.gateway';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private repo: Repository<Contact>,
    private gateway: MessageGateway,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  async create(data: CreateContactDto) {
    if (!data.email || !data.message || !data.nom) {
      throw new BadRequestException('Champs manquants');
    }

    const contact = this.repo.create({
      ...data,
      status: 'nouveau',
    });
    const saved = await this.repo.save(contact);
    this.notificationGateway.emitNewMessage();
    return saved;
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

    const saved = await this.repo.save(contact);
    this.notificationGateway.emitUpdate();
    return saved;
  }

  async markAsUnread(id: number) {
    const contact = await this.findOne(id);
    contact.status = 'nouveau';

    const saved = await this.repo.save(contact);
    this.notificationGateway.emitNewMessage();
    return saved;
  }

  async markAsTreat(id: number) {
    const contact = await this.findOne(id);
    contact.status = 'traite';

    const saved = await this.repo.save(contact);
    return saved;
  }

  async remove(id: number) {
    const contact = await this.findOne(id);
    return this.repo.remove(contact);
  }

  async count() {
    return this.repo.count({
      where: { status: 'nouveau' },
    });
  }
}
