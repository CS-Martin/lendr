import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UserDto {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: 0x12345678910,
    })
    @IsString()
    address!: string;

    @ApiProperty({
        description: 'Username of the user',
        example: 'kaiju123',
    })
    @IsString()
    @IsOptional()
    username?: string;

    @ApiProperty({
        description: 'Avatar of the user',
        example: 'https://example.com/avatar.png',
    })
    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @ApiProperty({
        description: 'Bio of the user',
        example: 'I am a kaiju',
    })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiProperty({
        description: 'Creation date of the user',
        example: '2025-07-12T10:49:03.000Z',
    })
    @IsDate()
    @Type(() => Date)
    createdAt!: Date;

    @ApiProperty({
        description: 'Update date of the user',
        example: '2025-07-12T10:49:03.000Z',
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    updatedAt?: Date;
}
