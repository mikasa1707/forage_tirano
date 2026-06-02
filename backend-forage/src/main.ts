import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  console.log('DB URL:', process.env.DATABASE_URL);
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://radiant-beauty-production-903e.up.railway.app',
      'https://foragetirano-production.up.railway.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // // ✅ rendre uploads accessible
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads',
  // });

  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
