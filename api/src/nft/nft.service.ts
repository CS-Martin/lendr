import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { NftDbService } from './nft.db.service';
import { NftDto } from './dto/nft.dto';
import { NFT } from '@prisma/client';
import { ResponseDto } from 'lib/shared/dto/response.dto';
import { UsersDbService } from 'users/users.db.service';

@Injectable()
export class NftService {
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
    } catch(error) {
      this.logger.error('Failed to create NFT', error);
      throw new BadRequestException('Failed to create NFT');
    }
  }

  async update(
    address: string, 
    updateNftDto: UpdateNftDto
  ): Promise<ResponseDto<NftDto>> {
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

  async findAll(): Promise<ResponseDto<NftDto[]>> {
    this.logger.log('Fetching NFTs');

    try {
      const nfts = await this.nftDbService.findAll();
      const nftDtos = nfts?.map(nft => this.convertToNftDto(nft));
      return {
        statusCode: 200,
        data: nftDtos,
        message: 'NFTs fetched successfully',
      }
    } catch (error) {
      this.logger.error('Failed to fetch NFTs', error);
      throw new BadRequestException('Failed to fetch NFTs');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} nft`;
  }

  remove(id: number) {
    return `This action removes a #${id} nft`;
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

    const nftDto: NftDto= new NftDto();

    nftDto.address = nft.address ?? '';
    nftDto.name = nft.name ?? '';
    nftDto.description = nft.description ?? '';
    nftDto.imageUrl = nft.imageUrl ?? '';
    nftDto.createdAt = nft.createdAt;
    nftDto.updatedAt = nft.updatedAt ?? undefined;

    return nftDto;
  }
}
