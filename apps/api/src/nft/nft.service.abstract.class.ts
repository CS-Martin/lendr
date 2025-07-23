import { FilterNftDto, CreateNftDto, UpdateNftDto, NftDto, ResponseDto } from '@repo/shared-dtos';

export abstract class NftServiceAbstractClass {
  abstract create(dto: CreateNftDto): Promise<ResponseDto<NftDto>>;

  abstract update(address: string, dto: UpdateNftDto): Promise<ResponseDto<NftDto>>;

  abstract find(filter: FilterNftDto): Promise<ResponseDto<NftDto[]>>;

  abstract findOne(address: string): Promise<ResponseDto<NftDto>>;

  abstract remove(address: string): Promise<ResponseDto<null>>;
}
