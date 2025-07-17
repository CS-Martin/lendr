import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller({ path: 'user', version: '1' })
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new user using wallet address as its primary key',
    })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
    })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all users',
    })
    @ApiResponse({
        status: 200,
        description: 'Users found successfully',
    })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':address')
    @ApiOperation({
        summary: 'Find a specific user',
    })
    @ApiResponse({
        status: 200,
        description: 'User found successfully',
    })
    findOne(@Param('address') address: string) {
        return this.usersService.findOne(address);
    }

    @Patch(':address')
    @ApiOperation({
        summary: 'Update a specific user',
    })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
    })
    update(
        @Param('address') address: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(address, updateUserDto);
    }
}
