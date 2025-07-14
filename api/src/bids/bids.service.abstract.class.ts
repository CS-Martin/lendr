import { ResponseDto } from 'lib/shared/dto/response.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidDto } from './dto/bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

export abstract class BidsServiceAbstractClass {
    abstract create(createBidDto: CreateBidDto): Promise<ResponseDto<BidDto>>;

    abstract update(
        bidId: number,
        updateBidDto: UpdateBidDto,
    ): Promise<ResponseDto<BidDto>>;

    abstract findFilteredBids(params: {
        bidderAddress?: string;
        rentalPostId?: number;
    }): Promise<ResponseDto<BidDto[]>>;

    abstract findByBidId(id: number): Promise<ResponseDto<BidDto>>;
}
