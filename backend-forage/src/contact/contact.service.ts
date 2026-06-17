import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as path from 'path';
import { JsonStorageService } from '../../data/json-storage.service';
import { Contact } from './contact.interface';
import { CreateContactDto } from './dto/create-contact.dto';
import { MessageGateway } from './message.gateway';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class ContactService {
  private file = path.join(process.cwd(), 'data/contacts.json');

  constructor(
    private storage: JsonStorageService<Contact>,
    private gateway: MessageGateway,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(data: CreateContactDto) {
    if (!data.email || !data.message || !data.nom) {
      throw new BadRequestException('Champs manquants');
    }

    const list = await this.storage.read(this.file);

    const newContact: Contact = {
      id: list.length ? Math.max(...list.map(c => c.id)) + 1 : 1,

      nom: data.nom,
      email: data.email,
      telephone: data.telephone,

      sujet: data.sujet,
      message: data.message,

      status: 'nouveau',

      createdAt: new Date().toISOString(),
    };

    list.push(newContact);

    await this.storage.write(this.file, list);

    // 🔥 websocket event
    this.notificationGateway.emitNewMessage();

    return newContact;
  }

  async findAll() {
    const list = await this.storage.read(this.file);

    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
  }

  async findOne(id: number) {
    const list = await this.findAll();

    const contact = list.find(c => c.id === id);

    if (!contact) {
      throw new NotFoundException('Message introuvable');
    }

    return contact;
  }

  async saveAll(list: Contact[]) {
    await this.storage.write(this.file, list);
  }

  async markAsRead(id: number) {
    const list = await this.storage.read(this.file);

    const contact = list.find(c => c.id === id);
    if (!contact) throw new NotFoundException();

    contact.status = 'lu';

    await this.saveAll(list);

    this.notificationGateway.emitUpdate();

    return contact;
  }

  async markAsUnread(id: number) {
    const list = await this.storage.read(this.file);

    const contact = list.find(c => c.id === id);
    if (!contact) throw new NotFoundException();

    contact.status = 'nouveau';

    await this.saveAll(list);

    this.notificationGateway.emitNewMessage();

    return contact;
  }

  async markAsTreat(id: number) {
    const list = await this.storage.read(this.file);

    const contact = list.find(c => c.id === id);
    if (!contact) throw new NotFoundException();

    contact.status = 'traite';

    await this.saveAll(list);

    return contact;
  }

  async remove(id: number) {
    const list = await this.storage.read(this.file);

    const filtered = list.filter(c => c.id !== id);

    if (filtered.length === list.length) {
      throw new NotFoundException('Message introuvable');
    }

    await this.storage.write(this.file, filtered);

    return { ok: true };
  }

  async count() {
    const list = await this.storage.read(this.file);

    return list.filter(c => c.status === 'nouveau').length;
  }
}