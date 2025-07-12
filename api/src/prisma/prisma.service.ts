import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    async onModuleInit() {
        try {
            await this.$connect();
        } catch (error) {
            console.error('Failed to connect to the database:', error);
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
        } catch (error) {
            console.error('Failed to disconnect from the database:', error);
        }
    }

    enableShutdownHooks(): void {
        process.on('beforeExit', () => {
            void this.$disconnect();
        });
    }
}
