import { Module } from '@nestjs/common';
import { RentalPostsService } from './rental-posts.service';
import { RentalPostsController } from './rental-posts.controller';
import { RentalPostsDbService } from './rental-posts.db.service';

@Module({
  controllers: [RentalPostsController],
  providers: [RentalPostsService, RentalPostsDbService],
  exports: [RentalPostsService, RentalPostsDbService],
})
export class RentalPostsModule {}
