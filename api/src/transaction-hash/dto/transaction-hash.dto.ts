import { ApiProperty } from '@nestjs/swagger';

export class TransactionHashDto {
  @ApiProperty({
    description: 'Blockchain transaction hash',
    example: '0xabcdef1234567890deadbeefabcdef1234567890',
  })
  transactionHash!: string;

  @ApiProperty({
    description: 'Rental ID associated with the transaction',
    example: '1',
  })
  rentalId!: number;
}
