import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterNftDto {
  @ApiPropertyOptional({ description: 'Address of the NFT owner' })
  @IsOptional()
  @IsString()
  ownerAddress?: string;

  @ApiPropertyOptional({ description: 'Title of the NFT' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Category of the NFT' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Collection name of the NFT' })
  @IsOptional()
  @IsString()
  collectionName?: string;
}
