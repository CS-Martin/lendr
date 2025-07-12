import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersDbService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<UserDto[]> {
        const users = await this.prisma.user.findMany();

        return users;
    }
}
