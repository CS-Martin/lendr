import { ApiProperty } from '@nestjs/swagger';

export class User {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: 0x12345678910,
    })
    address!: string;
}
