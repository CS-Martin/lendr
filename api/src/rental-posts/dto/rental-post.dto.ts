import { ApiProperty } from '@nestjs/swagger';
import { RentalListingStatus } from '@prisma/client';

export class RentalPostDto {
    @ApiProperty({
        description: 'The rental post ID',
        example: 1,
        required: true,
        type: Number,
    })
    rentalPostId: number;

    @ApiProperty({
        description: 'The poster address',
        example: '0x1234567890123456789012345678901234567890',
        required: true,
        type: String,
    })
    posterAddress!: string;

    @ApiProperty({
        description: 'The rental post name',
        example: 'Rental Post 1',
        required: true,
        type: String,
    })
    name!: string;

    @ApiProperty({
        description: 'The rental post description',
        example: 'This is a rental post',
        required: true,
        type: String,
    })
    description!: string;

    @ApiProperty({
        description: 'The rental post hourly rate',
        example: 10,
        required: true,
        type: Number,
    })
    hourlyRate!: number;

    @ApiProperty({
        description: 'The rental post collateral',
        example: 10,
        required: true,
        type: Number,
    })
    collateral!: number;

    @ApiProperty({
        description: 'The rental post is biddable',
        example: true,
        required: true,
        type: Boolean,
    })
    isBiddable!: boolean;

    @ApiProperty({
        description: 'The rental post bidding start time',
        example: '2025-07-14T16:09:00.000Z',
        required: false,
        type: Date,
    })
    biddingStarttime?: Date;

    @ApiProperty({
        description: 'The rental post bidding end time',
        example: '2025-07-14T16:09:00.000Z',
        required: false,
        type: Date,
    })
    biddingEndtime?: Date;

    @ApiProperty({
        description: 'The rental post is active',
        example: true,
        required: true,
        type: Boolean,
    })
    isActive!: boolean;

    @ApiProperty({
        description: 'The rental post status code',
        example: 'AVAILABLE',
        required: true,
        enum: RentalListingStatus,
        enumName: 'RentalListingStatus',
        default: RentalListingStatus.AVAILABLE
    })
    statusCode!: RentalListingStatus;

    @ApiProperty({
        description: 'The rental post created at',
        example: '2025-07-14T16:09:00.000Z',
        required: true,
        type: Date,
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'The rental post updated at',
        example: '2025-07-21T16:09:00.000Z',
        required: false,
        type: Date,
    })
    updatedAt?: Date;
}
