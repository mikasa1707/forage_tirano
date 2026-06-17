import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MessageGateway } from './message.gateway';
import { NotificationGateway } from './notification.gateway';
import { StorageModule } from 'data/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [ContactController],
  providers: [ContactService, MessageGateway, NotificationGateway],
  exports: [MessageGateway, ContactService],
})
export class ContactModule {}
