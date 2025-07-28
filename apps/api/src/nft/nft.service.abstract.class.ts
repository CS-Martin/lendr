import { FilterNftDto, CreateNftDto, UpdateNftDto, NftDto, ResponseDto } from '@repo/shared-dtos';

export abstract class NftServiceAbstractClass {
  abstract create(dto: CreateNftDto): Promise<ResponseDto<NftDto>>;

  abstract update(id: number, dto: UpdateNftDto): Promise<ResponseDto<NftDto>>;

  abstract find(filter: FilterNftDto): Promise<ResponseDto<NftDto[]>>;

  abstract findOne(id: number): Promise<ResponseDto<NftDto>>;

  abstract remove(id: number): Promise<ResponseDto<null>>;
}
