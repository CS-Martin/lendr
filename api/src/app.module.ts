import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { NftModule } from './nft/nft.module';

@Module({
    imports: [PrismaModule, UsersModule, NftModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
