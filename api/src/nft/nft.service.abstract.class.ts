import { NFT } from '@prisma/client';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { NftDto } from './dto/nft.dto';
import { ResponseDto } from 'lib/shared/dto/response.dto';

export abstract class NftServiceAbstractClass {
  abstract create(dto: CreateNftDto): Promise<ResponseDto<NftDto>>;

  abstract update(address: string, dto: UpdateNftDto): Promise<ResponseDto<NftDto>>;

  abstract find(
    filter?: Partial<Pick<NFT, 'userAddress' | 'title' | 'category' | 'collectionName'>>
  ): Promise<ResponseDto<NftDto[]>>;

  abstract findOne(address: string): Promise<ResponseDto<NftDto>>;

  abstract remove(address: string): Promise<ResponseDto<null>>;
}
