import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TravauxModule } from './travaux/travaux.module';
import { UploadModule } from './upload/upload.module';
import { EquipesModule } from './equipes/equipes.module';
import { ServicesModule } from './services/services.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Travaux } from './travaux/entities/travaux.entities';
import { TravauxPhoto } from './travaux/entities/travaux-photo.entity';
import { Equipe } from './equipes/entities/equipe.entity';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Service } from './services/entities/service.entity';
import { ContactModule } from './contact/contact.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Contact } from './contact/entities/contact.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AdminModule,
    TravauxModule,
    UploadModule,
    EquipesModule,
    ServicesModule,
    ContactModule,
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: '',
    //   database: 'forage',
    //   entities: [Travaux, TravauxPhoto, Equipe, Service, User, Contact],
    //   synchronize: false,
    // }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,
      entities: [Travaux, TravauxPhoto, Equipe, Service, User, Contact],
      synchronize: true,
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'uploads'),
    //   serveRoot: '/uploads',
    //   serveStaticOptions: {
    //     index: false, // 🔥 IMPORTANT
    //   },
    // }),
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
