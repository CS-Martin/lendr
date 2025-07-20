import { TransactionHashDto } from './transaction-hash.dto';
import { OmitType } from '@nestjs/swagger';

export class CreateTransactionHashDto extends OmitType(
    TransactionHashDto,
    [],
) {}
