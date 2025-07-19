import { ApiProperty } from '@nestjs/swagger';

export class NftDto {
    @ApiProperty({
        description: 'Unique address identifier for the NFT',
        example: '0xNFT1',
    })
    address!: string;

    @ApiProperty({
        description: 'Address of the NFT owner',
        example: '0x12345678910',
    })
    userAddress!: string;

    @ApiProperty({
        description: 'Title of the NFT',
        example: 'OjouNii #1',
    })
    title!: string;

    @ApiProperty({
        description: 'Image URL of the NFT',
        example: 'https://example.com/nft1.png',
    })
    imageUrl!: string;

    @ApiProperty({
        description: 'Optional description of the NFT',
        example: 'Roaring NFT monster',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Optional category of the NFT',
        example: 'Monster',
        required: false,
    })
    category?: string;

    @ApiProperty({
        description: 'Optional floor price of the NFT',
        example: 0.5,
        required: false,
    })
    floorPrice?: number;

    @ApiProperty({
        description: 'Optional collection name of the NFT',
        example: 'Kaiju Collection',
        required: false,
    })
    collectionName?: string;

    @ApiProperty({
        description: 'Date when the NFT was created',
        example: '2025-07-12T10:49:03.000Z',
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'Date when the NFT was last updated',
        example: '2025-07-13T10:49:03.000Z',
        required: false,
    })
    updatedAt?: Date;
}
