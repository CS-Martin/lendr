import { PartialType } from '@nestjs/swagger';
import { CreateBidDto } from './create-bid.dto.js';

export class UpdateBidDto extends PartialType(CreateBidDto) { }
