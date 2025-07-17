import { ResponseDto } from 'lib/shared/dto/response.dto';
import { CreateBidDto, UpdateBidDto, BidDto } from './dto';

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
