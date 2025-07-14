import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RentalsModule } from './rentals/rentals.module';
import { RentalPostsModule } from './rental-posts/rental-posts.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [UsersModule, RentalsModule, RentalPostsModule, PrismaModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
