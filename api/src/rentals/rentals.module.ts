import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { RentlsDbService } from './rentals.db.service';

@Module({
    controllers: [RentalsController],
    providers: [RentalsService, RentlsDbService],
})
export class RentalsModule { }
