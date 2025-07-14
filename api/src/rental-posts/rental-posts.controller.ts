import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRentalPostDto } from './dto/create-rental-post.dto';
import { UpdateRentalPostDto } from './dto/update-rental-post.dto';
import { RentalPostsService } from './rental-posts.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Rental Posts')
@Controller(`${new ConfigService().get('API_VERSION')}/rental-posts`)
export class RentalPostsController {
    constructor(private readonly rentalPostsService: RentalPostsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new rental post' })
    @ApiResponse({
        status: 201,
        description: 'The rental post has been successfully created.',
    })
    create(@Body() createRentalPostDto: CreateRentalPostDto) {
        return this.rentalPostsService.create(createRentalPostDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all rental posts' })
    @ApiResponse({ status: 200, description: 'List of rental posts.' })
    findAll() {
        return this.rentalPostsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a rental post by ID' })
    @ApiResponse({
        status: 200,
        description: 'The rental post with the specified ID.',
    })
    @ApiResponse({ status: 404, description: 'Rental post not found.' })
    findOne(@Param('id') id: string) {
        return this.rentalPostsService.findOne(+id);
    }

    @Get('user/:address')
    @ApiOperation({ summary: 'Get all rental posts of a specific user' })
    @ApiResponse({
        status: 200,
        description: 'List of rental posts for the specified user.',
    })
    findAllByAddress(@Param('address') address: string) {
        return this.rentalPostsService.findAllByAddress(address);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a rental post' })
    @ApiResponse({
        status: 200,
        description: 'The rental post has been successfully updated.',
    })
    @ApiResponse({ status: 404, description: 'Rental post not found.' })
    update(
        @Param('id') id: string,
        @Body() updateRentalPostDto: UpdateRentalPostDto,
    ) {
        return this.rentalPostsService.update(+id, updateRentalPostDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a rental post' })
    @ApiResponse({
        status: 200,
        description: 'The rental post has been successfully deleted.',
    })
    @ApiResponse({ status: 404, description: 'Rental post not found.' })
    remove(@Param('id') id: string) {
        return this.rentalPostsService.remove(+id);
    }
}
