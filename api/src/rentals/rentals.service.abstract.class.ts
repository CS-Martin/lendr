import { Rental } from '@prisma/client';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { RentalDto } from './dto/rental.dto';
import { ResponseDto } from 'lib/shared/dto/response.dto';

export abstract class RentalsServiceAbstractClass {
    abstract create(
        createRentalDto: CreateRentalDto,
    ): Promise<ResponseDto<RentalDto>>;

    abstract update(
        rentalId: number,
        updateRentalDto: UpdateRentalDto,
    ): Promise<ResponseDto<RentalDto>>;

    abstract findAll(): Promise<ResponseDto<RentalDto[]>>;

    abstract findOne(rentalId: number): Promise<ResponseDto<RentalDto>>;

    abstract remove(rentalId: number): Promise<ResponseDto<void>>;

    abstract convertToRentalDto(rental: Rental): RentalDto;
}
