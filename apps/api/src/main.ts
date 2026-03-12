import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 TrimTime API running on http://localhost:${port}/graphql`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
