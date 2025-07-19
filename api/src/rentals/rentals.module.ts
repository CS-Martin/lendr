import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { RentalsDbService } from './rentals.db.service';

@Module({
    controllers: [RentalsController],
    providers: [RentalsService, RentalsDbService],
})
export class RentalsModule {}
