import { PartialType } from '@nestjs/swagger';
import { CreateRentalPostDto } from './create-rental-post.dto';

export class UpdateRentalPostDto extends PartialType(CreateRentalPostDto) {}
