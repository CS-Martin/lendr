import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller(`${new ConfigService().get('API_VERSION')}/bids`)
export class BidsController {
    constructor(private readonly bidsService: BidsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new bid' })
    @ApiResponse({ status: 201, description: 'Bid created successfully' })
    create(@Body() createBidDto: CreateBidDto) {
        return this.bidsService.create(createBidDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a bid' })
    @ApiResponse({ status: 200, description: 'Bid updated successfully' })
    update(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto) {
        return this.bidsService.update(+id, updateBidDto);
    }

    @Get()
    @ApiOperation({ summary: 'Find bids by filters' })
    @ApiQuery({ name: 'bidderAddress', required: false, type: String })
    @ApiQuery({ name: 'rentalPostId', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Bids found successfully' })
    findFilteredBids(
        @Query('bidderAddress') bidderAddress?: string,
        @Query('rentalPostId') rentalPostId?: number,
    ) {
        return this.bidsService.findFilteredBids({
            bidderAddress,
            rentalPostId: rentalPostId ? Number(rentalPostId) : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find a bid by ID' })
    @ApiResponse({ status: 200, description: 'Bid found successfully' })
    findOne(@Param('id') id: string) {
        return this.bidsService.findByBidId(+id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a bid by ID' })
    @ApiResponse({ status: 200, description: 'Bid deleted successfully' })
    remove(@Param('id') id: string) {
        return this.bidsService.remove(+id);
    }
}
