import { CreateRentalPostDto } from './dto/create-rental-post.dto';
import { RentalPost } from '@prisma/client';
import { UpdateRentalPostDto } from './dto/update-rental-post.dto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class RentalPostsDbService {
    private readonly logger = new Logger(RentalPostsDbService.name);

    constructor(private readonly prisma: PrismaService) {
        this.logger.log('RentalPostsDbService initialized');
    }

    async create(
        createRentalPostDto: CreateRentalPostDto,
    ): Promise<RentalPost> {
        const data = {
            ...createRentalPostDto,
        };

        console.log('DATA:', data);
        const rentalPost = await this.prisma.rentalPost.create({
            data: data,
        });

        return rentalPost;
    }

    async update(
        rentalPostId: number,
        updateRentalPostDto: UpdateRentalPostDto,
    ): Promise<RentalPost> {
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
        console.log('POSTER ADDRESS:', address);

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
