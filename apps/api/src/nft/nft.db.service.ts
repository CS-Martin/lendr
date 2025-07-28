import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NFT } from '@prisma/client';
import { FilterNftDto, CreateNftDto, UpdateNftDto } from '@repo/shared-dtos';

@Injectable()
export class NftDbService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNftDto: CreateNftDto): Promise<NFT> {
    // Omit ownerAddress since we're using the relation
    const { ownerAddress, ...nftData } = createNftDto;

    const nft = await this.prisma.nFT.create({
      data: {
        ...nftData,
        metadata: createNftDto.metadata as Prisma.InputJsonValue,
        owner: {
          connect: { address: ownerAddress },
        },
      },
    });

    return nft;
  }

  async update(id: number, updateNftDto: UpdateNftDto): Promise<NFT> {
    const nft = await this.prisma.nFT.update({
      where: {
        id,
      },
      data: {
        ...updateNftDto,
        metadata: updateNftDto.metadata as Prisma.InputJsonValue,
      },
    });

    return nft;
  }

  async find(filters?: FilterNftDto): Promise<NFT[]> {
    const where: Prisma.NFTWhereInput = {};

    if (filters?.ownerAddress) {
      where.ownerAddress = filters.ownerAddress;
    }

    if (filters?.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.collectionName) {
      where.collectionName = filters.collectionName;
    }

    return this.prisma.nFT.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<NFT | null> {
    return this.prisma.nFT.findUnique({
      where: {
        id,
      },
    });
  }

  async delete(id: number): Promise<NFT> {
    return this.prisma.nFT.delete({
      where: { id },
    });
  }
}
