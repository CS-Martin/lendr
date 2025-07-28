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

    const user = await this.userDbService.findOne(createNftDto.ownerAddress);

    if (!user) {
      this.logger.error('User not found', createNftDto.ownerAddress);
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

  async update(id: number, updateNftDto: UpdateNftDto): Promise<ResponseDto<NftDto>> {
    this.logger.log('Updating NFT by id', id);

    const nft = await this.nftDbService.findOne(id);

    if (!nft) {
      this.logger.error('NFT not found', id);
      throw new NotFoundException('NFT not found');
    }

    try {
      const updatedNft = await this.nftDbService.update(id, updateNftDto);

      if (!updatedNft) {
        this.logger.error('Failed to update NFT', id);
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

  async findOne(id: number): Promise<ResponseDto<NftDto>> {
    this.logger.log(`Fetching NFT with id: ${id}`);

    try {
      const nft = await this.nftDbService.findOne(id);

      const nftDto = this.convertToNftDto(nft);

      return {
        statusCode: 200,
        data: nftDto,
        message: 'NFT fetched successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to fetch NFT with id: ${id}`, error);
      throw new BadRequestException('Failed to fetch NFT');
    }
  }

  async remove(id: number): Promise<ResponseDto<null>> {
    this.logger.log(`Removing NFT with id: ${id}`);

    try {
      await this.nftDbService.delete(id);

      return {
        statusCode: 200,
        data: null,
        message: 'NFT deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete NFT with id: ${id}`, error);
      throw new BadRequestException('Failed to delete NFT');
    }
  }

  /**
   * Converts a NFT prisma entity to a NftDto.
   * @param nft The NFT entity to convert.
   * @returns The NftDto.
   */
  private convertToNftDto(nft: NFT | null): NftDto {
    const dto = new NftDto();

    dto.id = nft?.id ?? 0;
    dto.contractAddress = nft?.contractAddress ?? '';
    dto.tokenId = nft?.tokenId ?? '';
    dto.ownerAddress = nft?.ownerAddress ?? '';
    dto.title = nft?.title ?? '';
    dto.imageUrl = nft?.imageUrl ?? '';
    dto.description = nft?.description ?? '';
    dto.category = nft?.category ?? '';
    dto.floorPrice = nft?.floorPrice ?? 0;
    dto.collectionName = nft?.collectionName ?? '';
    dto.metadata = nft?.metadata;
    dto.isListable = nft?.isListable ?? false;
    dto.createdAt = nft?.createdAt ?? new Date();

    return dto;
  }
}
