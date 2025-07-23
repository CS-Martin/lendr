import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { BidsDbService } from './bids.db.service';

@Module({
  controllers: [BidsController],
  providers: [BidsService, BidsDbService],
})
export class BidsModule {}
