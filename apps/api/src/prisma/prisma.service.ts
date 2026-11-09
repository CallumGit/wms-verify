import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService — opakowuje PrismaClient i wpina go w cykl życia aplikacji NestJS.
 * Połączenie nawiązywane przy starcie modułu, zamykane przy zamknięciu aplikacji.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Połączono z bazą danych (PostgreSQL).');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Rozłączono z bazą danych.');
  }

  /** Prosty test połączenia — używany przez health-check. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
