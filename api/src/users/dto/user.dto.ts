import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: 0x12345678910,
    })
    address!: string;

    @ApiProperty({
        description: 'Username of the user',
        example: 'kaiju123',
    })
    username?: string;

    @ApiProperty({
        description: 'Avatar of the user',
        example: 'https://example.com/avatar.png',
    })
    avatarUrl?: string;

    @ApiProperty({
        description: 'Bio of the user',
        example: 'I am a kaiju',
    })
    bio?: string;
}
