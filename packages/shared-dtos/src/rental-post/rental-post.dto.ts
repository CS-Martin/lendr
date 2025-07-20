import { ApiProperty } from '@nestjs/swagger';
import { RentalListingStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class RentalPostDto {
    @ApiProperty({
        description: 'The rental post ID',
        example: 1,
        required: true,
        type: Number,
    })
    @IsNumber()
    rentalPostId!: number;

    @ApiProperty({
        description: 'The poster address',
        example: '0x1234567890123456789012345678901234567890',
        required: true,
        type: String,
    })
    @IsString()
    posterAddress!: string;

    @ApiProperty({
        description: 'The rental post name',
        example: 'Rental Post 1',
        required: true,
        type: String,
    })
    @IsString()
    name!: string;

    @ApiProperty({
        description: 'The rental post description',
        example: 'This is a rental post',
        required: true,
        type: String,
    })
    @IsString()
    description!: string;

    @ApiProperty({
        description: 'The rental post category',
        example: 'Digital Art',
        required: false,
        type: String,
    })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({
        description: 'The rental post hourly rate',
        example: 10,
        required: true,
        type: Number,
    })
    @IsNumber()
    hourlyRate!: number;

    @ApiProperty({
        description: 'The rental post collateral',
        example: 10,
        required: true,
        type: Number,
    })
    @IsNumber()
    collateral!: number;

    @ApiProperty({
        description: 'The rental post is biddable',
        example: true,
        required: true,
        type: Boolean,
    })
    @IsBoolean()
    isBiddable!: boolean;

    @ApiProperty({
        description: 'The rental post bidding start time',
        example: '2025-07-14T16:09:00.000Z',
        required: false,
        type: Date,
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    biddingStarttime?: Date;

    @ApiProperty({
        description: 'The rental post bidding end time',
        example: '2025-07-14T16:09:00.000Z',
        required: false,
        type: Date,
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    biddingEndtime?: Date;

    @ApiProperty({
        description: 'The rental post is active',
        example: true,
        required: true,
        type: Boolean,
    })
    @IsBoolean()
    isActive!: boolean;

    @ApiProperty({
        description: 'The rental post status code',
        example: 'AVAILABLE',
        required: true,
        enum: RentalListingStatus,
        enumName: 'RentalListingStatus',
        default: RentalListingStatus.AVAILABLE,
    })
    @IsEnum(RentalListingStatus)
    statusCode!: RentalListingStatus;

    @ApiProperty({
        description: 'The rental post created at',
        example: '2025-07-14T16:09:00.000Z',
        required: true,
        type: Date,
    })
    @IsDate()
    @Type(() => Date)
    createdAt!: Date;

    @ApiProperty({
        description: 'The rental post updated at',
        example: '2025-07-21T16:09:00.000Z',
        required: false,
        type: Date,
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    updatedAt?: Date;
}
