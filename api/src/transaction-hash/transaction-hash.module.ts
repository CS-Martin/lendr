import { Module } from '@nestjs/common';
import { TransactionHashService } from './transaction-hash.service';
import { TransactionHashController } from './transaction-hash.controller';
import { TransactionHashDbService } from './transaction-hash.db.service';
import { RentalPostsModule } from 'rental-posts/rental-posts.module';

@Module({
  imports: [RentalPostsModule],
  controllers: [TransactionHashController],
  providers: [TransactionHashService, TransactionHashDbService],
  exports: [TransactionHashService, TransactionHashDbService]
})
export class TransactionHashModule {}
