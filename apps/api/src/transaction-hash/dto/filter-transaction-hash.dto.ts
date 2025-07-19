import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class FilterTransactionHashDto {
    @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
    @IsOptional()
    @IsString()
    transactionHash?: string;

    @ApiPropertyOptional({
        description: 'Rental ID associated with the transaction',
    })
    @IsOptional()
    @IsNumber()
    rentalId?: number;
}
