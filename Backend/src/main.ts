import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on: http://127.0.0.1:${port}`);
}
bootstrap();
