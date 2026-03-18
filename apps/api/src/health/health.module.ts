import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../modules/database/database.module';
import { RedisModule } from '../modules/redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
