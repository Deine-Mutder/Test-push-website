import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Kapselt den Prisma-Client als NestJS-Provider.
 * Wird global bereitgestellt (siehe PrismaModule), damit nicht jedes
 * Feature-Modul den Client erneut importieren/instanziieren muss.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Datenbankverbindung hergestellt');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
