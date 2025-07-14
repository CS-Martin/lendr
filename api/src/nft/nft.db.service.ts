import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { NFT } from '@prisma/client';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';

@Injectable()
export class NftDbService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNftDto: CreateNftDto): Promise<NFT> {
    const nft = await this.prisma.nFT.create({
      data: createNftDto,
    });

    return nft;
  }

  async update(address: string, updateNftDto: UpdateNftDto): Promise<NFT> {
    const nft = await this.prisma.nFT.update({
      where: {
        address,
      },
      data: updateNftDto,
    });

    return nft;
  }

  async findAll(): Promise<NFT[]> {
    return this.prisma.nFT.findMany();
  }

  async findOne(address: string): Promise<NFT | null> {
    return this.prisma.nFT.findUnique({
      where: {
        address,
      },
    });
  }

  async delete(address: string): Promise<NFT> {
      return this.prisma.nFT.delete({
      where: { address },
      });
  }
}
