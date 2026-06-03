import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('Current working directory:', process.cwd());
  console.log('Uploads path:', join(process.cwd(), 'uploads'));

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://radiant-beauty-production-903e.up.railway.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use('/uploads', (req, res, next) => {
    console.log('UPLOAD HIT:', req.url);
    next();
  });

  // // ✅ rendre uploads accessible
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads',
  // });

  await app.listen(3000);
}
void bootstrap();
