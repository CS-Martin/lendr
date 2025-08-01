import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RentalsDbService } from './rentals.db.service';
import { Rental } from '@prisma/client';
import { RentalsServiceAbstractClass } from './rentals.service.abstract.class';
import { CreateRentalDto, UpdateRentalDto, RentalDto, ResponseDto } from '@repo/shared-dtos';

@Injectable()
export class RentalsService implements RentalsServiceAbstractClass {
  private readonly logger = new Logger(RentalsService.name);

  constructor(private readonly rentlsDbService: RentalsDbService) {}

  async create(createRentalDto: CreateRentalDto): Promise<ResponseDto<RentalDto>> {
    this.logger.log('Creating rental', createRentalDto);

    try {
      const rental: Rental = await this.rentlsDbService.create(createRentalDto);

      if (!rental) {
        throw new NotFoundException('Rental not found');
      }

      const rentalDto = this.convertToRentalDto(rental);

      return {
        statusCode: 201,
        data: rentalDto,
        message: 'Rental created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create rental', error);
      throw new BadRequestException('Failed to create rental');
    }
  }

  async update(rentalId: number, updateRentalDto: UpdateRentalDto): Promise<ResponseDto<RentalDto>> {
    this.logger.log('Updating rental by rentalId', rentalId);

    try {
      const rental = await this.rentlsDbService.update(rentalId, updateRentalDto);

      if (!rental) {
        throw new NotFoundException('Rental not found');
      }

      const rentalDto = this.convertToRentalDto(rental);

      return {
        statusCode: 200,
        data: rentalDto,
        message: 'Rental updated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to update rental', error);
      throw new BadRequestException('Failed to update rental');
    }
  }

  async remove(rentalId: number): Promise<ResponseDto<void>> {
    this.logger.log('Removing rental by rentalId', rentalId);

    try {
      await this.rentlsDbService.remove(rentalId);

      return {
        statusCode: 200,
        message: 'Rental removed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to remove rental', error);
      throw new BadRequestException('Failed to remove rental');
    }
  }

  async findAll(): Promise<ResponseDto<RentalDto[]>> {
    this.logger.log('Finding all rentals');

    try {
      const rentals: Rental[] | null = await this.rentlsDbService.findAll();

      if (!rentals) {
        throw new NotFoundException('Rentals not found');
      }

      const rentalDtos = rentals?.map((rental) => this.convertToRentalDto(rental));

      return {
        statusCode: 200,
        data: rentalDtos,
        message: 'Rentals found successfully',
      };
    } catch (error) {
      this.logger.error('Failed to find rentals', error);
      throw new BadRequestException('Failed to find rentals');
    }
  }

  async findOne(rentalId: number): Promise<ResponseDto<RentalDto>> {
    this.logger.log('Finding rental by rentalId', rentalId);

    try {
      const rental = await this.rentlsDbService.findOne(rentalId);

      if (!rental) {
        throw new NotFoundException('Rental not found');
      }

      const rentalDto = this.convertToRentalDto(rental);

      return {
        statusCode: 200,
        data: rentalDto,
        message: 'Rental found successfully',
      };
    } catch (error) {
      this.logger.error('Failed to find rental', error);
      throw new BadRequestException('Failed to find rental');
    }
  }

  convertToRentalDto(rental: Rental): RentalDto {
    const rentalDto: RentalDto = new RentalDto();

    rentalDto.rentalId = rental.rentalId;
    rentalDto.renterAddress = rental.renterAddress ?? '';
    rentalDto.rentalPostId = rental.rentalPostId ?? 0;
    rentalDto.bidId = rental.bidId ?? 0;
    rentalDto.duration = rental.duration ?? 0;
    rentalDto.amount = rental.amount ?? 0;
    rentalDto.startDatetime = rental.startDatetime;
    rentalDto.endDatetime = rental.endDatetime;

    return rentalDto;
  }
}
