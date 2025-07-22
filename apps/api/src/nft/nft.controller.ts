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

  @Get(':address')
  @ApiOperation({ summary: 'Get an NFT by its address' })
  @ApiResponse({ status: 200, description: 'NFT found' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  findOne(@Param('address') address: string) {
    return this.nftService.findOne(address);
  }

  @Patch(':address')
  @ApiOperation({ summary: 'Update an NFT by its address' })
  @ApiResponse({ status: 200, description: 'NFT updated successfully' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  update(@Param('address') address: string, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(address, updateNftDto);
  }

  @Delete(':address')
  @ApiOperation({ summary: 'Delete an NFT by its address' })
  @ApiResponse({ status: 200, description: 'NFT deleted successfully' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  remove(@Param('address') address: string) {
    return this.nftService.remove(address);
  }
}
