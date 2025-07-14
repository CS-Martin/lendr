import { ApiProperty } from '@nestjs/swagger';

export class BidDto {
    @ApiProperty({
        description: 'The bid ID',
        example: 1,
        required: true,
        type: Number,
    })
    bidId!: number;

    @ApiProperty({
        description: 'The parent rental post ID',
        example: 1,
        required: true,
        type: Number,
    })
    rentalPostId!: number;

    @ApiProperty({
        description: `The bidder's wallet address`,
        example: '0x12345678910',
        required: true,
        type: String,
    })
    bidderAddress!: string;

    @ApiProperty({
        description: 'Message of the bidder to owner',
        example: 'I need it for my guild raid later',
        required: false,
        type: String,
    })
    message?: string;

    @ApiProperty({
        description: 'Proposed hourly rate of the bidder',
        example: 10,
        required: true,
        type: Number,
    })
    hourlyRate!: number;

    @ApiProperty({
        description: 'Proposed rental duration of the bidder',
        example: '48(Int) for 48 hours or 2 days',
        required: true,
        type: Number,
    })
    rentalDuration!: number;

    @ApiProperty({
        description: 'Status if the bidder is accepted by the owner',
        example: false,
        required: true,
        type: Boolean,
    })
    isAccepted: boolean;

    @ApiProperty({
        description: 'The date and time when the bid was accepted',
        example: '2025-07-21T16:09:00.000Z',
        required: false,
        type: Date,
    })
    acceptedTimestamp?: Date;

    @ApiProperty({
        description: 'The date and time the bidder placed their bid',
        example: '2025-07-21T16:09:00.000Z',
        required: true,
        type: Date,
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'The date and time the bidder updated their bid',
        example: '2025-07-28T16:09:00.000Z',
        required: false,
        type: Date,
    })
    updatedAt?: Date;
}
