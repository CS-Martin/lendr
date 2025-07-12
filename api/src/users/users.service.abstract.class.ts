import { ResponseDto } from 'lib/shared/dto/response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

export abstract class UsersServiceAbstractClass {
    abstract create(
        createUserDto: CreateUserDto,
    ): Promise<ResponseDto<UserDto>>;

    abstract update(
        address: string,
        updateUserDto: UpdateUserDto,
    ): Promise<ResponseDto<UserDto>>;

    abstract findAll(): Promise<ResponseDto<UserDto[]>>;

    abstract findOne(address: string): Promise<ResponseDto<UserDto>>;

    abstract convertToUserDto(user: User | null): UserDto;
}
