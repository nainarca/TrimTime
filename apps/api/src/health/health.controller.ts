import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<Record<string, unknown>> {
    const [db] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: db.status === 'fulfilled' ? 'up' : 'down',
    };
  }
}
