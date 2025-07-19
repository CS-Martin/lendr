import { Module } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { NftDbService } from './nft.db.service';
import { UsersModule } from 'users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [NftController],
    providers: [NftService, NftDbService],
})
export class NftModule {}
