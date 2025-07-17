import { PrismaService } from '@prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersDbService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = await this.prisma.user.create({
            data: createUserDto,
        });

        return user;
    }

    async update(address: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.prisma.user.update({
            where: {
                address,
            },
            data: updateUserDto,
        });

        return user;
    }

    async findAll(): Promise<User[] | null> {
        const users = await this.prisma.user.findMany();

        return users;
    }

    async findOne(address: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                address,
            },
        });

        return user;
    }
}
