import { ResponseDto } from 'lib/shared/dto/response.dto';
import { CreateTransactionHashDto, TransactionHashDto, FilterTransactionHashDto } from './dto';

export abstract class TransactionHashServiceAbstractClass {
  abstract create(
    createTransactionHashDto: CreateTransactionHashDto
  ): Promise<ResponseDto<TransactionHashDto>>;

  abstract find(filter?: FilterTransactionHashDto): Promise<ResponseDto<TransactionHashDto[]>>;

  abstract findOne(transactionHash: string): Promise<ResponseDto<TransactionHashDto>>;

  abstract remove(transactionHash: string): Promise<ResponseDto<null>>;
}
