import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, TransactionHash } from '@prisma/client';
import { CreateTransactionHashDto, FilterTransactionHashDto } from '@repo/shared-dtos';

@Injectable()
export class TransactionHashDbService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateTransactionHashDto): Promise<TransactionHash> {
    return this.prisma.transactionHash.create({
      data: createDto,
    });
  }

  async find(filters?: FilterTransactionHashDto): Promise<TransactionHash[]> {
    const where: Prisma.TransactionHashWhereInput = {};

    if (filters?.transactionHash) {
      where.transactionHash = filters.transactionHash;
    }

    if (filters?.rentalId) {
      where.rentalId = filters.rentalId;
    }

    return this.prisma.transactionHash.findMany({
      where,
      orderBy: { transactionHash: 'asc' },
    });
  }

  async findOne(transactionHash: string): Promise<TransactionHash | null> {
    return this.prisma.transactionHash.findUnique({
      where: { transactionHash },
    });
  }

  async delete(hash: string): Promise<TransactionHash> {
    return this.prisma.transactionHash.delete({
      where: {
        transactionHash: hash,
      },
    });
  }
}
