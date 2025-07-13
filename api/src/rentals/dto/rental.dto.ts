import { ApiProperty } from '@nestjs/swagger';

export class RentalDto {
    @ApiProperty({
        description: 'The rental ID',
        example: '1',
    })
    rentalId!: number;

    @ApiProperty({
        description: 'The renter address',
        example: '0x1234567890123456789012345678901234567890',
    })
    renterAddress!: string;

    @ApiProperty({
        description: 'The rental post ID',
        example: '1',
    })
    rentalPostId!: number;

    @ApiProperty({
        description: 'The bid ID',
        example: '1',
    })
    bidId?: number;

    @ApiProperty({
        description: 'The duration of the rental',
        example: '69',
    })
    duration!: number;

    @ApiProperty({
        description: 'The amount of the rental',
        example: '1',
    })
    amount!: number;

    @ApiProperty({
        description: 'The start date of the rental',
        example: '2025-07-14T12:00:00Z',
        format: 'date-time',
    })
    startDatetime!: Date;

    @ApiProperty({
        description: 'The end date of the rental',
        example: '2025-07-21T12:00:00Z',
        format: 'date-time',
    })
    endDatetime!: Date;
}
