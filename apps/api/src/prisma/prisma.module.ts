import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule — globalny, więc PrismaService jest dostępny we wszystkich
 * modułach domeny (auth, master-data, verification, orders, ...) bez importu.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
