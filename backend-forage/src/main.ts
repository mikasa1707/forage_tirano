import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('Current working directory:', process.cwd());
  console.log('Uploads path:', join(process.cwd(), 'uploads'));

  app.enableCors({
    origin: ['http://localhost:4200', 'https://forage-tirano.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
}
void bootstrap();
