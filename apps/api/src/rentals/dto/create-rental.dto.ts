import { OmitType } from '@nestjs/swagger';
import { RentalDto } from './rental.dto';

export class CreateRentalDto extends OmitType(RentalDto, ['rentalId']) {}
