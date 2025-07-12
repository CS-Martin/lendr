import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
    readonly body: T;

    @ApiProperty()
    statusCode!: number;

    @ApiProperty({ type: 'object', additionalProperties: true })
    data: T;

    @ApiProperty({ required: false })
    message?: string;

    constructor(statusCode: number, body: T) {
        this.statusCode = statusCode;
        this.body = body;
    }
}
