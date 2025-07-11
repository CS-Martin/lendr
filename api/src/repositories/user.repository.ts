import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(address: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { address } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(address: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { address },
      data,
    });
  }

  async delete(address: string): Promise<User> {
    return this.prisma.user.delete({ where: { address } });
  }
}
