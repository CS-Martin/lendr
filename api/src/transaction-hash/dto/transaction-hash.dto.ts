import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class TransactionHashDto {
  @ApiProperty({
    description: 'Blockchain transaction hash',
    example: '0xabcdef1234567890deadbeefabcdef1234567890',
  })
  @IsString()
  transactionHash!: string;

  @ApiProperty({
    description: 'Rental ID associated with the transaction',
    example: 1,
  })
  @IsNumber()
  rentalId!: number;
}
