import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Bid, Prisma } from '@prisma/client';
import { CreateBidDto, UpdateBidDto } from '@repo/shared-dtos';

@Injectable()
export class BidsDbService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBidDto: CreateBidDto): Promise<Bid> {
    const bid = await this.prisma.bid.create({
      data: createBidDto,
    });

    return bid;
  }

  async remove(id: number): Promise<Bid> {
    const bid = await this.prisma.bid.delete({
      where: {
        bidId: id,
      },
    });

    return bid;
  }

  async update(bidId: number, updateBidDto: UpdateBidDto): Promise<Bid> {
    const bid = await this.prisma.bid.update({
      where: {
        bidId,
      },
      data: updateBidDto,
    });

    return bid;
  }

  async findFiltered(params: { bidderAddress?: string; rentalPostId?: number }): Promise<Bid[]> {
    const { bidderAddress, rentalPostId } = params;

    const where: Prisma.BidWhereInput = {};

    if (bidderAddress) where.bidderAddress = bidderAddress;
    if (rentalPostId !== undefined) where.rentalPostId = rentalPostId;

    return this.prisma.bid.findMany({ where });
  }

  async findByBidId(id: number): Promise<Bid | null> {
    const bid = await this.prisma.bid.findUnique({
      where: {
        bidId: id,
      },
    });

    return bid;
  }
}
