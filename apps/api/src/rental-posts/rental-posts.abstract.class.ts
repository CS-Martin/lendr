import { RentalPost } from '@prisma/client';
import { CreateRentalPostDto, UpdateRentalPostDto, RentalPostDto, ResponseDto } from '@repo/shared-dtos';

export abstract class RentalPostsServiceAbstractClass {
  abstract create(createRentalPostDto: CreateRentalPostDto): Promise<ResponseDto<RentalPostDto>>;

  abstract update(rentalPostId: number, updateRentalPostDto: UpdateRentalPostDto): Promise<ResponseDto<RentalPostDto>>;

  abstract remove(rentalPostId: number): Promise<ResponseDto<void>>;

  abstract findAllByAddress(address: string): Promise<ResponseDto<RentalPostDto[]>>;

  abstract findAll(): Promise<ResponseDto<RentalPostDto[]>>;

  abstract findOne(rentalPostId: number): Promise<ResponseDto<RentalPostDto | null>>;

  abstract convertToRentalPostDto(rentalPost: RentalPost): RentalPostDto;
}
