import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RentalPostsDbService } from './rental-posts.db.service';
import { RentalPost } from '@prisma/client';
import { RentalPostsServiceAbstractClass } from './rental-posts.abstract.class';
import { RentalPostStatusEnum } from 'lib/shared/enums/rental-posts.status';
import { ResponseDto, CreateRentalPostDto, UpdateRentalPostDto, RentalPostDto } from '@repo/shared-dtos';

@Injectable()
export class RentalPostsService implements RentalPostsServiceAbstractClass {
  private readonly logger = new Logger(RentalPostsService.name);

  constructor(private readonly rentalPostsDbService: RentalPostsDbService) {}

  async create(createRentalPostDto: CreateRentalPostDto): Promise<ResponseDto<RentalPostDto>> {
    this.logger.log(`Creating rental post for address: ${createRentalPostDto.posterAddress}`);

    try {
      const rentalPost = await this.rentalPostsDbService.create(createRentalPostDto);

      const rentalPostDto = this.convertToRentalPostDto(rentalPost);

      return {
        statusCode: 201,
        data: rentalPostDto,
        message: 'Rental post created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create rental post', error);
      throw new BadRequestException('Failed to create rental post');
    }
  }

  async findAll(): Promise<ResponseDto<RentalPostDto[]>> {
    this.logger.log('Finding all rental posts');

    try {
      const rentalPosts = await this.rentalPostsDbService.findAll();

      const rentalPostDtos = rentalPosts.map((rentalPost) => this.convertToRentalPostDto(rentalPost));

      return {
        statusCode: 200,
        data: rentalPostDtos,
        message: 'Rental posts found successfully',
      };
    } catch (error) {
      this.logger.error('Failed to find rental posts', error);
      throw new BadRequestException('Failed to find rental posts');
    }
  }

  async findOne(rentalPostId: number): Promise<ResponseDto<RentalPostDto | null>> {
    this.logger.log(`Finding rental post with ID: ${rentalPostId}`);

    try {
      const rentalPost = await this.rentalPostsDbService.findOne(rentalPostId);

      if (!rentalPost) {
        throw new NotFoundException(`Rental post with ID ${rentalPostId} not found`);
      }

      const rentalPostDto = this.convertToRentalPostDto(rentalPost);

      return {
        statusCode: 200,
        data: rentalPostDto,
        message: 'Rental post found successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to find rental post with ID ${rentalPostId}`, error);
      throw new BadRequestException(`Failed to find rental post with ID ${rentalPostId}`);
    }
  }

  async findAllByAddress(address: string): Promise<ResponseDto<RentalPostDto[]>> {
    this.logger.log(`Finding rental posts for address: ${address}`);

    try {
      const rentalPosts = await this.rentalPostsDbService.findAllByAddress(address);

      const rentalPostDtos = rentalPosts.map((rentalPost) => this.convertToRentalPostDto(rentalPost));

      return {
        statusCode: 200,
        data: rentalPostDtos,
        message: 'Rental posts found successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to find rental posts for address ${address}`, error);
      throw new BadRequestException(`Failed to find rental posts for address ${address}`);
    }
  }

  async update(rentalPostId: number, updateRentalPostDto: UpdateRentalPostDto): Promise<ResponseDto<RentalPostDto>> {
    this.logger.log(`Updating rental post with ID: ${rentalPostId}`);

    try {
      const rentalPost = await this.rentalPostsDbService.update(rentalPostId, updateRentalPostDto);

      const rentalPostDto = this.convertToRentalPostDto(rentalPost);

      return {
        statusCode: 200,
        data: rentalPostDto,
        message: 'Rental post updated successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to update rental post with ID ${rentalPostId}`, error);
      throw new BadRequestException(`Failed to update rental post with ID ${rentalPostId}`);
    }
  }

  async remove(id: number): Promise<ResponseDto<void>> {
    this.logger.log(`Removing rental post with ID: ${id}`);

    try {
      await this.rentalPostsDbService.remove(id);

      return {
        statusCode: 200,
        data: undefined,
        message: 'Rental post removed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to remove rental post with ID ${id}`, error);
      throw new BadRequestException(`Failed to remove rental post with ID ${id}`);
    }
  }

  convertToRentalPostDto(rentalPost: RentalPost): RentalPostDto {
    const rentalPostDto: RentalPostDto = new RentalPostDto();

    rentalPostDto.rentalPostId = rentalPost.rentalPostId;
    rentalPostDto.posterAddress = rentalPost.posterAddress;
    rentalPostDto.name = rentalPost.name;
    rentalPostDto.description = rentalPost.description ?? '';

    rentalPostDto.category = rentalPost.category ?? undefined;
    rentalPostDto.hourlyRate = rentalPost.hourlyRate;
    rentalPostDto.collateral = rentalPost.collateral;
    rentalPostDto.isBiddable = rentalPost.isBiddable;
    rentalPostDto.biddingStarttime = rentalPost.biddingStarttime ?? undefined;
    rentalPostDto.biddingEndtime = rentalPost.biddingEndtime ?? undefined;
    rentalPostDto.isActive = rentalPost.isActive;
    rentalPostDto.statusCode = rentalPost.statusCode as RentalPostStatusEnum;
    rentalPostDto.createdAt = rentalPost.createdAt;
    rentalPostDto.updatedAt = rentalPost.updatedAt ?? undefined;

    return rentalPostDto;
  }
}
