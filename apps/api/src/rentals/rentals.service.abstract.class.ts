import { Rental } from '@prisma/client';
import {
    CreateRentalDto,
    UpdateRentalDto,
    RentalDto,
    ResponseDto,
} from '@repo/shared-dtos';

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
