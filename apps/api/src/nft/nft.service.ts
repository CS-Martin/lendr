import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NftDbService } from './nft.db.service';
import { NFT } from '@prisma/client';
import { UsersDbService } from 'users/users.db.service';
import { NftServiceAbstractClass } from './nft.service.abstract.class';
import { FilterNftDto, CreateNftDto, UpdateNftDto, ResponseDto, NftDto } from '@repo/shared-dtos';

@Injectable()
export class NftService implements NftServiceAbstractClass {
  private readonly logger = new Logger(NftService.name);

  constructor(
    private readonly nftDbService: NftDbService,
    private readonly userDbService: UsersDbService,
  ) {}

  async create(createNftDto: CreateNftDto): Promise<ResponseDto<NftDto>> {
    this.logger.log('Creating NFT', createNftDto);

    const nft = await this.nftDbService.findOne(createNftDto.address);
    const user = await this.userDbService.findOne(createNftDto.userAddress);

    if (nft) {
      this.logger.error('NFT already exists', createNftDto.address);
      throw new BadRequestException('NFT already exists');
    } else if (!user) {
      this.logger.error('User not found', createNftDto.userAddress);
      throw new NotFoundException('User not found');
    }

    try {
      const newNft = await this.nftDbService.create(createNftDto);

      return {
        statusCode: 201,
        data: this.convertToNftDto(newNft),
        message: 'NFT created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create NFT', error);
      throw new BadRequestException('Failed to create NFT');
    }
  }

  async update(address: string, updateNftDto: UpdateNftDto): Promise<ResponseDto<NftDto>> {
    this.logger.log('Updating NFT by address', address);

    const nft = await this.nftDbService.findOne(address);

    if (!nft) {
      this.logger.error('NFT not found', address);
      throw new NotFoundException('NFT not found');
    }

    try {
      const updatedNft = await this.nftDbService.update(address, updateNftDto);

      if (!updatedNft) {
        this.logger.error('Failed to update NFT', address);
        throw new BadRequestException('Failed to update NFT');
      }

      return {
        statusCode: 200,
        data: this.convertToNftDto(updatedNft),
        message: 'NFT updated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to update NFT', error);
      throw new BadRequestException('Failed to update NFT');
    }
  }

  async find(filter?: FilterNftDto): Promise<ResponseDto<NftDto[]>> {
    this.logger.log('Fetching NFTs', JSON.stringify(filter));

    try {
      const nfts = await this.nftDbService.find(filter);
      const nftDtos = nfts.map((nft) => this.convertToNftDto(nft));

      return {
        statusCode: 200,
        data: nftDtos,
        message: 'NFTs fetched successfully',
      };
    } catch (error) {
      this.logger.error('Failed to fetch NFTs', error);
      throw new BadRequestException('Failed to fetch NFTs');
    }
  }

  async findOne(address: string): Promise<ResponseDto<NftDto>> {
    this.logger.log(`Fetching NFT with address: ${address}`);

    try {
      const nft = await this.nftDbService.findOne(address);

      const nftDto = this.convertToNftDto(nft);

      return {
        statusCode: 200,
        data: nftDto,
        message: 'NFT fetched successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to fetch NFT with address: ${address}`, error);
      throw new BadRequestException('Failed to fetch NFT');
    }
  }

  async remove(address: string): Promise<ResponseDto<null>> {
    this.logger.log(`Removing NFT with address: ${address}`);

    try {
      await this.nftDbService.delete(address);

      return {
        statusCode: 200,
        data: null,
        message: 'NFT deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete NFT with address: ${address}`, error);
      throw new BadRequestException('Failed to delete NFT');
    }
  }

  /**
   * Converts a NFT prisma entity to a NftDto.
   * @param nft The NFT entity to convert.
   * @returns The NftDto.
   */
  private convertToNftDto(nft: NFT | null): NftDto {
    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    const dto = new NftDto();
    dto.address = nft.address;
    dto.userAddress = nft.userAddress;
    dto.title = nft.title;
    dto.imageUrl = nft.imageUrl;
    dto.description = nft.description ?? '';
    dto.category = nft.category ?? '';
    dto.floorPrice = nft.floorPrice ?? 0;
    dto.collectionName = nft.collectionName ?? '';
    dto.createdAt = nft.createdAt;
    dto.updatedAt = nft.updatedAt;

    return dto;
  }
}
