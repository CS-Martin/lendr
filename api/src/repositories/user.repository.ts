import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(address: string): Promise<User | null> {
        return await this.prisma.user.findUnique({ where: { address } });
    }

    async findAll(): Promise<User[]> {
        return await this.prisma.user.findMany();
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return await this.prisma.user.create({ data });
    }

    async update(address: string, data: Partial<User>): Promise<User> {
        return await this.prisma.user.update({
            where: { address },
            data,
        });
    }

    async delete(address: string): Promise<User> {
        return await this.prisma.user.delete({ where: { address } });
    }
}
