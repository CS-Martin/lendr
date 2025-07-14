import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersDbService } from './users.db.service';
import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { UsersServiceAbstractClass } from './users.service.abstract.class';
import { ResponseDto } from 'lib/shared/dto/response.dto';
import { UserDto } from './dto/user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService implements UsersServiceAbstractClass {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly usersDbService: UsersDbService) { }

    async create(createUserDto: CreateUserDto): Promise<ResponseDto<UserDto>> {
        this.logger.log('Creating user', createUserDto);

        try {
            const user = await this.usersDbService.create(createUserDto);

            const userDto = this.convertToUserDto(user);

            return {
                statusCode: 201,
                data: userDto,
                message: 'User created successfully',
            };
        } catch (error) {
            this.logger.error('Failed to create user', error);
            throw new BadRequestException('Failed to create user');
        }
    }

    async update(
        address: string,
        updateUserDto: UpdateUserDto,
    ): Promise<ResponseDto<UserDto>> {
        this.logger.log('Updating user by address', address);

        const user = await this.findOne(address);

        if (!user) {
            this.logger.error('User not found', address);
            throw new NotFoundException('User not found');
        }

        try {
            const user: User | null = await this.usersDbService.update(
                address,
                updateUserDto,
            );

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const userDto = this.convertToUserDto(user);

            return {
                statusCode: 200,
                data: userDto,
                message: 'User updated successfully',
            };
        } catch (error) {
            this.logger.error('Failed to update user', error);
            throw new BadRequestException('Failed to update user');
        }
    }

    async findAll(): Promise<ResponseDto<UserDto[]>> {
        this.logger.log('Finding all users');

        try {
            const users: User[] | null = await this.usersDbService.findAll();

            if (!users) {
                throw new NotFoundException('Users not found');
            }

            const userDtos = users?.map((user) => this.convertToUserDto(user));

            return {
                statusCode: 200,
                data: userDtos,
                message: 'Users found successfully',
            };
        } catch (error) {
            this.logger.error('Failed to find users', error);
            throw new BadRequestException('Failed to find users');
        }
    }

    async findOne(address: string): Promise<ResponseDto<UserDto>> {
        this.logger.log('Finding user by address', address);

        try {
            const user: User | null =
                await this.usersDbService.findOne(address);

            if (!user) {
                throw new NotFoundException('Failed to find user');
            }

            const userDto = this.convertToUserDto(user);
            return {
                statusCode: 200,
                data: userDto,
                message: 'User found successfully',
            };
        } catch (error) {
            this.logger.error('Failed to find user', error);
            throw new BadRequestException('Failed to find user');
        }
    }

    /**
     * Converts a User prisma entity to a UserDto.
     * @param user The User entity to convert.
     * @returns The UserDto.
     */
    convertToUserDto(user: User | null): UserDto {
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userDto: UserDto = new UserDto();

        userDto.address = user.address ?? '';
        userDto.username = user.username ?? '';
        userDto.avatarUrl = user.avatarUrl ?? '';
        userDto.bio = user.bio ?? '';
        userDto.createdAt = user.createdAt;
        userDto.updatedAt = user.updatedAt ?? undefined;

        return userDto;
    }
}
