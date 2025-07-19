import { ResponseDto } from 'lib/shared/dto/response.dto';
import { FilterNftDto, CreateNftDto, UpdateNftDto, NftDto } from './dto';

export abstract class NftServiceAbstractClass {
  abstract create(dto: CreateNftDto): Promise<ResponseDto<NftDto>>;

  abstract update(address: string, dto: UpdateNftDto): Promise<ResponseDto<NftDto>>;

  abstract find(filter: FilterNftDto): Promise<ResponseDto<NftDto[]>>;

  abstract findOne(address: string): Promise<ResponseDto<NftDto>>;

  abstract remove(address: string): Promise<ResponseDto<null>>;
}
