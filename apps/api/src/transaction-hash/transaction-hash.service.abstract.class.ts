import { CreateTransactionHashDto, TransactionHashDto, FilterTransactionHashDto, ResponseDto } from '@repo/shared-dtos';

export abstract class TransactionHashServiceAbstractClass {
  abstract create(createTransactionHashDto: CreateTransactionHashDto): Promise<ResponseDto<TransactionHashDto>>;

  abstract find(filter?: FilterTransactionHashDto): Promise<ResponseDto<TransactionHashDto[]>>;

  abstract findOne(transactionHash: string): Promise<ResponseDto<TransactionHashDto>>;

  abstract remove(transactionHash: string): Promise<ResponseDto<null>>;
}
