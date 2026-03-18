import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { RedisService } from '../modules/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check(): Promise<Record<string, unknown>> {
    const [db, cache] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.get('__health__'),
    ]);

    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      db:    db.status    === 'fulfilled' ? 'up' : 'down',
      cache: cache.status === 'fulfilled' ? 'up' : 'down',
    };

    return status;
  }
}
