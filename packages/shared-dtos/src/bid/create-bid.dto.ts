import { OmitType } from '@nestjs/swagger';
import { BidDto } from './bid.dto.js';

export class CreateBidDto extends OmitType(BidDto, ['bidId'] as const) { }
