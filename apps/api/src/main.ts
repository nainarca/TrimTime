import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Global exception filter (REST only — GraphQL exceptions pass through)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Socket.io adapter — must be set before listen(); default WsAdapter uses `ws`,
  // which is incompatible with socket.io-client used in all three frontend apps.
  app.useWebSocketAdapter(new IoAdapter(app));

  // CORS — allow all frontend apps (main dashboard :4200, admin-dashboard :4201, mobile :4300, display :4400)
  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    allowedOrigins.push(
      'http://localhost:4200',
      'http://localhost:4201',
      'http://localhost:4300',
      'http://localhost:4400',
    );
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 TrimTime API running on http://localhost:${port}/graphql`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
