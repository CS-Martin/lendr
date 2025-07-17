import { OmitType } from '@nestjs/swagger';
import { NftDto } from './nft.dto';

export class CreateNftDto extends OmitType(NftDto, [
    'createdAt',
    'updatedAt',
]) {}
