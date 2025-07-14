import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RentalsModule } from './rentals/rentals.module';

@Module({
    imports: [PrismaModule, UsersModule, RentalsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
