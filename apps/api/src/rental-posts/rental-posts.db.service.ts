import { RentalPost } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateRentalPostDto, UpdateRentalPostDto } from '@repo/shared-dtos';

@Injectable()
export class RentalPostsDbService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRentalPostDto: CreateRentalPostDto): Promise<RentalPost> {
    const { posterAddress, nftId, ...createRentalPostData } = createRentalPostDto;
    const rentalPost = await this.prisma.rentalPost.create({
      data: {
        ...createRentalPostData,

        // Establish the poster relationship
        poster: {
          connect: {
            address: posterAddress,
          },
        },

        // Establish the nft relationship
        nft: {
          connect: {
            id: nftId,
          },
        },
      },
    });

    return rentalPost;
  }

  async update(rentalPostId: number, updateRentalPostDto: UpdateRentalPostDto): Promise<RentalPost> {
    const rentalPost = await this.prisma.rentalPost.update({
      where: {
        rentalPostId,
      },
      data: updateRentalPostDto,
    });

    return rentalPost;
  }

  async findAll(): Promise<RentalPost[]> {
    const rentalPosts = await this.prisma.rentalPost.findMany();

    return rentalPosts;
  }

  async findAllByAddress(address: string): Promise<RentalPost[]> {
    const rentalPosts = await this.prisma.rentalPost.findMany({
      where: {
        posterAddress: {
          equals: address,
        },
      },
    });

    return rentalPosts;
  }

  async findOne(rentalPostId: number): Promise<RentalPost | null> {
    const rentalPost = await this.prisma.rentalPost.findUnique({
      where: {
        rentalPostId,
      },
    });

    return rentalPost;
  }

  async remove(rentalPostId: number): Promise<void> {
    await this.prisma.rentalPost.delete({
      where: {
        rentalPostId,
      },
    });
  }
}
