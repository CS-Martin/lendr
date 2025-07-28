import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NftService } from './nft.service';
import { CreateNftDto, UpdateNftDto, FilterNftDto } from '@repo/shared-dtos';

@ApiTags('NFTs')
@Controller({ path: 'nft', version: '1' })
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new NFT' })
  @ApiResponse({ status: 201, description: 'NFT created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() createNftDto: CreateNftDto) {
    return this.nftService.create(createNftDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all NFTs with optional filters' })
  @ApiResponse({ status: 200, description: 'NFTs retrieved successfully' })
  findAll(@Query() filters: FilterNftDto) {
    return this.nftService.find(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an NFT by its id' })
  @ApiResponse({ status: 200, description: 'NFT found' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  findOne(@Param('id') id: number) {
    return this.nftService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an NFT by its id' })
  @ApiResponse({ status: 200, description: 'NFT updated successfully' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  update(@Param('id') id: number, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(id, updateNftDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an NFT by its id' })
  @ApiResponse({ status: 200, description: 'NFT deleted successfully' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  remove(@Param('id') id: number) {
    return this.nftService.remove(id);
  }
}
