import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class NftDto {
  @ApiProperty({
    description: 'Unique identifier for the NFT',
    example: 'nft1',
  })
  @IsNumber()
  id!: number;

  @ApiProperty({
    description: 'Unique address identifier for the NFT',
    example: '0xNFT1',
  })
  @IsString()
  contractAddress!: string;

  @ApiProperty({
    description: 'Token identifier for the NFT',
    example: '1234567890',
  })
  @IsString()
  tokenId!: string;

  @ApiProperty({
    description: 'Unique address identifier for the NFT',
    example: '0x3123300412',
  })
  @IsString()
  ownerAddress!: string;

  @ApiProperty({
    description: 'Title of the NFT',
    example: 'OjouNii #1',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Image URL of the NFT',
    example: 'https://example.com/nft1.png',
  })
  @IsString()
  imageUrl!: string;

  @ApiProperty({
    description: 'Optional description of the NFT',
    example: 'Roaring NFT monster',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Optional category of the NFT',
    example: 'Monster',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Optional floor price of the NFT',
    example: 0.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  floorPrice?: number;

  @ApiProperty({
    description: 'Optional collection name of the NFT',
    example: 'Kaiju Collection',
    required: false,
  })
  @IsString()
  @IsOptional()
  collectionName?: string;

  @ApiProperty({
    description: 'Optional metadata of the NFT',
    example: '{ "name": "OjouNii #1", "description": "Roaring NFT monster", "image": "https://example.com/nft1.png" }',
    required: false,
    format: 'json',
  })
  @Type(() => Object)
  @IsObject()
  @IsOptional()
  metadata?: Prisma.JsonValue;

  @ApiProperty({
    description: 'Optional is listable of the NFT',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isListable?: boolean;

  @ApiProperty({
    description: 'Date when the NFT was created',
    example: '2025-07-12T10:49:03.000Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({
    description: 'Date when the NFT was last updated',
    example: '2025-07-13T10:49:03.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;
}
