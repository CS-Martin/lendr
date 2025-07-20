import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
    @ApiProperty()
    statusCode!: number;

    @ApiProperty({ type: 'object', additionalProperties: true })
    data?: T;

    @ApiProperty({ required: false })
    message?: string;

    constructor(statusCode: number, data?: T, message?: string) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }
}
