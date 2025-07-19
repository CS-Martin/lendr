import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';

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
    username?: string;

    @ApiProperty({
        description: 'Avatar of the user',
        example: 'https://example.com/avatar.png',
    })
    @IsString()
    avatarUrl?: string;

    @ApiProperty({
        description: 'Bio of the user',
        example: 'I am a kaiju',
    })
    @IsString()
    bio?: string;

    @ApiProperty({
        description: 'Creation date of the user',
        example: '2025-07-12T10:49:03.000Z',
    })
    @IsDate()
    createdAt!: Date;

    @ApiProperty({
        description: 'Update date of the user',
        example: '2025-07-12T10:49:03.000Z',
    })
    @IsDate()
    updatedAt?: Date;
}
