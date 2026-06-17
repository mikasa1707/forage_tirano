import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TravauxModule } from './travaux/travaux.module';
import { UploadModule } from './upload/upload.module';
import { EquipesModule } from './equipes/equipes.module';
import { ServicesModule } from './services/services.module';

import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ContactModule } from './contact/contact.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';

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
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   url: process.env.DATABASE_URI,
    //   entities: [Travaux, TravauxPhoto, Equipe, Service, User, Contact],
    //   synchronize: true,
    // }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'uploads'),
    //   serveRoot: '/uploads',
    //   serveStaticOptions: {
    //     index: false, // 🔥 IMPORTANT
    //   },
    // }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
