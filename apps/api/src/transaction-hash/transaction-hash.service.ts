import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TransactionHashDbService } from './transaction-hash.db.service';
import { TransactionHashServiceAbstractClass } from './transaction-hash.service.abstract.class';
import { CreateTransactionHashDto, TransactionHashDto, FilterTransactionHashDto, ResponseDto } from '@repo/shared-dtos';
import { TransactionHash } from '@prisma/client';
import { RentalPostsDbService } from 'rental-posts/rental-posts.db.service';

@Injectable()
export class TransactionHashService implements TransactionHashServiceAbstractClass {
  private readonly logger = new Logger(TransactionHashService.name);

  constructor(
    private readonly txDbService: TransactionHashDbService,
    private readonly rentalPostDbService: RentalPostsDbService,
  ) {}

  async create(createTransactionHashDto: CreateTransactionHashDto): Promise<ResponseDto<TransactionHashDto>> {
    this.logger.log('Creating transaction hash', createTransactionHashDto);

    const tx = await this.txDbService.findOne(createTransactionHashDto.transactionHash);
    const postId = await this.rentalPostDbService.findOne(createTransactionHashDto.rentalId);

    if (tx) {
      this.logger.error('Transaction hash already exists', createTransactionHashDto.transactionHash);
      throw new BadRequestException('Transaction hash already exists');
    } else if (!postId) {
      this.logger.error('Rental post not found', createTransactionHashDto.rentalId);
      throw new NotFoundException('Rental post not found');
    }

    try {
      const newTx = await this.txDbService.create(createTransactionHashDto);
      return {
        statusCode: 201,
        data: this.convertToDto(newTx),
        message: 'Transaction hash created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create transaction hash', error);
      throw new BadRequestException('Failed to create transaction hash');
    }
  }

  async find(filter?: FilterTransactionHashDto): Promise<ResponseDto<TransactionHashDto[]>> {
    this.logger.log('Fetching transaction hashes', JSON.stringify(filter));

    try {
      const txs = await this.txDbService.find(filter);
      const dtos = txs.map((tx) => this.convertToDto(tx));
      return {
        statusCode: 200,
        data: dtos,
        message: 'Transaction hashes fetched successfully',
      };
    } catch (error) {
      this.logger.error('Failed to fetch transaction hashes', error);
      throw new BadRequestException('Failed to fetch transaction hashes');
    }
  }

  async findOne(transactionHash: string): Promise<ResponseDto<TransactionHashDto>> {
    this.logger.log(`Fetching transaction hash: ${transactionHash}`);

    const tx = await this.txDbService.findOne(transactionHash);
    if (!tx) {
      this.logger.error('Transaction hash not found', transactionHash);
      throw new NotFoundException('Transaction hash not found');
    }

    return {
      statusCode: 200,
      data: this.convertToDto(tx),
      message: 'Transaction hash fetched successfully',
    };
  }

  async remove(transactionHash: string): Promise<ResponseDto<null>> {
    this.logger.log(`Deleting transaction hash: ${transactionHash}`);

    const tx = await this.txDbService.findOne(transactionHash);
    if (!tx) {
      this.logger.error('Transaction hash not found', transactionHash);
      throw new NotFoundException('Transaction hash not found');
    }

    try {
      await this.txDbService.delete(transactionHash);
      return {
        statusCode: 200,
        data: null,
        message: 'Transaction hash deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete transaction hash: ${transactionHash}`, error);
      throw new BadRequestException('Failed to delete transaction hash');
    }
  }

  /**
   * Converts a TransactionHash prisma entity to a TransactionHashDto.
   * @param tx The TransactionHash entity to convert.
   * @returns The TransactionHashDto.
   */
  private convertToDto(tx: TransactionHash | null): TransactionHashDto {
    if (!tx) throw new NotFoundException('Transaction hash not found');
    const dto = new TransactionHashDto();
    dto.transactionHash = tx.transactionHash;
    dto.rentalId = tx.rentalId;
    return dto;
  }
}
