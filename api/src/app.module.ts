import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { NftModule } from './nft/nft.module';
import { RentalsModule } from './rentals/rentals.module';
import { RentalPostsModule } from './rental-posts/rental-posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { BidsModule } from './bids/bids.module';

@Module({
    imports: [UsersModule, NftModule, RentalsModule, RentalPostsModule, PrismaModule, BidsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
