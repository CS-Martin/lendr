/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient } from '@prisma/client';
import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private initialized = false;

    constructor() {
        super();
        this.logger.log('PrismaService created');
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.initialized = true;
            this.logger.log('Successfully connected to the database');
        } catch (error) {
            this.logger.error('Failed to connect to the database:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('Successfully disconnected from the database');
        } catch (error) {
            this.logger.error('Failed to disconnect from the database:', error);
        }
    }

    enableShutdownHooks(): void {
        process.on('beforeExit', () => {
            void this.$disconnect();
        });
    }
}
