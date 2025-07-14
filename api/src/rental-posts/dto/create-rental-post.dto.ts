import { OmitType } from '@nestjs/swagger';
import { RentalPostDto } from './rental-post.dto';

export class CreateRentalPostDto extends OmitType(RentalPostDto, [
    'rentalPostId',
    'createdAt',
    'updatedAt',
] as const) { }
