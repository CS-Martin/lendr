import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class BidDto {
    @ApiProperty({
        description: 'The bid ID',
        example: 1,
        required: true,
        type: Number,
    })
    @IsNumber()
    bidId!: number;

    @ApiProperty({
        description: 'The parent rental post ID',
        example: 1,
        required: true,
        type: Number,
    })
    @IsNumber()
    rentalPostId!: number;

    @ApiProperty({
        description: `The bidder's wallet address`,
        example: '0x12345678910',
        required: true,
        type: String,
    })
    @IsString()
    bidderAddress!: string;

    @ApiProperty({
        description: 'Message of the bidder to owner',
        example: 'I need it for my guild raid later',
        required: false,
        type: String,
    })
    @IsString()
    @IsOptional()
    message?: string;

    @ApiProperty({
        description: 'Proposed hourly rate of the bidder',
        example: 10,
        required: true,
        type: Number,
    })
    @IsNumber()
    hourlyRate!: number;

    @ApiProperty({
        description: `Proposed rental duration of the bidder in hours (e.g. 48 for 48 hours or 2 days)`,
        example: 48,
        required: true,
        type: Number,
    })
    @IsNumber()
    rentalDuration!: number;

    @ApiProperty({
        description: 'Status if the bidder is accepted by the owner',
        example: false,
        required: true,
        type: Boolean,
    })
    @IsBoolean()
    isAccepted: boolean;

    @ApiProperty({
        description: 'The date and time when the bid was accepted',
        example: '2025-07-21T16:09:00.000Z',
        required: false,
        type: Date,
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    acceptedTimestamp?: Date;

    @ApiProperty({
        description: 'The date and time the bidder placed their bid',
        example: '2025-07-21T16:09:00.000Z',
        required: true,
        type: Date,
    })
    @IsDate()
    @Type(() => Date)
    createdAt!: Date;

    @ApiProperty({
        description: 'The date and time the bidder updated their bid',
        example: '2025-07-28T16:09:00.000Z',
        required: false,
        type: Date,
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    updatedAt?: Date;
}
