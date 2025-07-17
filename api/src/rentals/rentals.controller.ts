import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto, UpdateRentalDto } from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Rentals')
@Controller({ path: 'rental', version: '1' })
export class RentalsController {
    constructor(private readonly rentalsService: RentalsService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new rental',
    })
    @ApiResponse({
        status: 201,
        description: 'Rental created successfully.',
    })
    create(@Body() createRentalDto: CreateRentalDto) {
        return this.rentalsService.create(createRentalDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all rentals',
    })
    @ApiResponse({
        status: 200,
        description: 'Rentals found successfully.',
    })
    findAll() {
        return this.rentalsService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a rental by ID',
    })
    @ApiResponse({
        status: 200,
        description: 'The rental with the specified ID.',
    })
    findOne(@Param('id') id: string) {
        return this.rentalsService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update a rental',
    })
    @ApiResponse({
        status: 200,
        description: 'Rental updated successfully.',
    })
    update(@Param('id') id: string, @Body() updateRentalDto: UpdateRentalDto) {
        return this.rentalsService.update(+id, updateRentalDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a rental',
    })
    @ApiResponse({
        status: 200,
        description: 'Rental deleted successfully.',
    })
    remove(@Param('id') id: string) {
        return this.rentalsService.remove(+id);
    }
}
