import { Controller, Get } from '@nestjs/common';
import { ping, CORE_VERSION } from '@wms/core';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{
    status: string;
    core: string;
    corePing: string;
    database: string;
    timestamp: string;
  }> {
    const dbOk = await this.prisma.isHealthy();
    return {
      status: dbOk ? 'ok' : 'degraded',
      core: CORE_VERSION,
      corePing: ping(),
      database: dbOk ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }
}
