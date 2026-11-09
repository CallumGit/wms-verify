import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Wczytuje zmienne z .env w root projektu.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    // Globalny dostęp do bazy (Obszar 1).
    PrismaModule,
    // Kolejne moduły domeny dołączamy w następnych obszarach:
    // AuthModule (Obszar 2), MasterDataModule (Obszar 4),
    // VerificationModule (Obszar 5), OrdersModule (Obszar 6), SyncModule (Obszar 7),
    // RecognitionModule (Obszar 8), ReportingModule (Obszary 9-10).
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
