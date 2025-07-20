import { User } from '@prisma/client';
import {
    CreateUserDto,
    UpdateUserDto,
    UserDto,
    ResponseDto,
} from '@repo/shared-dtos';

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
