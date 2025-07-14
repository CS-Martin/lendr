import { ResponseDto } from 'lib/shared/dto/response.dto';
import { CreateRentalPostDto } from './dto/create-rental-post.dto';
import { RentalPostDto } from './dto/rental-post.dto';
import { UpdateRentalPostDto } from './dto/update-rental-post.dto';
import { RentalPost } from '@prisma/client';

export abstract class RentalPostsServiceAbstractClass {
    abstract create(
        createRentalPostDto: CreateRentalPostDto,
    ): Promise<ResponseDto<RentalPostDto>>;

    abstract update(
        rentalPostId: number,
        updateRentalPostDto: UpdateRentalPostDto,
    ): Promise<ResponseDto<RentalPostDto>>;

    abstract remove(rentalPostId: number): Promise<ResponseDto<void>>;

    abstract findAllByAddress(
        address: string,
    ): Promise<ResponseDto<RentalPostDto[]>>;

    abstract findAll(): Promise<ResponseDto<RentalPostDto[]>>;

    abstract findOne(
        rentalPostId: number,
    ): Promise<ResponseDto<RentalPostDto | null>>;

    abstract convertToRentalPostDto(rentalPost: RentalPost): RentalPostDto;
}
