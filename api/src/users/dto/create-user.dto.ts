import { OmitType } from '@nestjs/swagger';
import { UserDto } from '../dto/user.dto';

export class CreateUserDto extends OmitType(UserDto, [
    'createdAt',
    'updatedAt',
]) {}
