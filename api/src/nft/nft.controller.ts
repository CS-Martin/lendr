import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NftService } from './nft.service';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post()
  create(@Body() createNftDto: CreateNftDto) {
    return this.nftService.create(createNftDto);
  }

  @Get()
  findAll() {
    return this.nftService.findAll();
  }

  @Get(':address')
  findOne(@Param('address') address: string) {
    return this.nftService.findOne(address);
  }

  @Patch(':address')
  update(@Param('address') address: string, @Body() updateNftDto: UpdateNftDto) {
    return this.nftService.update(address, updateNftDto);
  }

  @Delete(':address')
  remove(@Param('address') address: string) {
    return this.nftService.remove(address);
  }
}
