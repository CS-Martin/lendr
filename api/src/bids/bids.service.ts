import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { BidDto } from './dto/bid.dto';
import { ResponseDto } from 'lib/shared/dto/response.dto';
import { Logger } from '@nestjs/common';
import { BidsDbService } from './bids.db.service';
import { Bid } from '@prisma/client';
import { BidsServiceAbstractClass } from './bids.service.abstract.class';

@Injectable()
export class BidsService implements BidsServiceAbstractClass {
    private readonly logger = new Logger(BidsService.name);

    constructor(private readonly bidsDbService: BidsDbService) { }

    async create(createBidDto: CreateBidDto): Promise<ResponseDto<BidDto>> {
        this.logger.log('Creating bid', createBidDto);

        try {
            const bid = await this.bidsDbService.create(createBidDto);

            const bidDto = this.convertToBidDto(bid);

            return {
                statusCode: 201,
                data: bidDto,
                message: 'Bid created successfully',
            };
        } catch (error) {
            this.logger.error('Failed to create bid', error);
            throw new BadRequestException('Failed to create bid');
        }
    }

    async update(
        rentalPostId: number,
        updateBidDto: UpdateBidDto,
    ): Promise<ResponseDto<BidDto>> {
        this.logger.log('Updating bid', updateBidDto);

        try {
            const bid = await this.bidsDbService.update(
                rentalPostId,
                updateBidDto,
            );

            const bidDto = this.convertToBidDto(bid);

            return {
                statusCode: 200,
                data: bidDto,
                message: 'Bid updated successfully',
            };
        } catch (error) {
            this.logger.error('Failed to update bid', error);
            throw new BadRequestException('Failed to update bid');
        }
    }

    async findFilteredBids(params: {
        bidderAddress?: string;
        rentalPostId?: number;
    }): Promise<ResponseDto<BidDto[]>> {
        this.logger.log('Finding filtered bids', params);

        try {
            const bids = await this.bidsDbService.findFiltered(params);

            const bidDtos = bids.map((bid) => this.convertToBidDto(bid));

            return {
                statusCode: 200,
                data: bidDtos,
                message: 'Bids found successfully',
            };
        } catch (error) {
            this.logger.error('Failed to find bids', error);
            throw new BadRequestException('Failed to find bids');
        }
    }

    async findByBidId(id: number): Promise<ResponseDto<BidDto>> {
        this.logger.log('Finding bid by id', id);

        try {
            const bid = await this.bidsDbService.findByBidId(id);

            if (!bid) {
                throw new NotFoundException(`Bid with ID ${id} not found`);
            }

            const bidDto = this.convertToBidDto(bid);

            return {
                statusCode: 200,
                data: bidDto,
                message: 'Bid found successfully',
            };
        } catch (error) {
            this.logger.error('Failed to find bid by id', error);
            throw new BadRequestException('Failed to find bid by id');
        }
    }

    async remove(id: number): Promise<ResponseDto<void>> {
        this.logger.log('Removing bid by id', id);

        try {
            await this.bidsDbService.remove(id);

            return {
                statusCode: 200,
                message: 'Bid removed successfully',
            };
        } catch (error) {
            this.logger.error('Failed to remove bid', error);
            throw new BadRequestException('Failed to remove bid');
        }
    }

    convertToBidDto(bid: Bid): BidDto {
        const bidDto: BidDto = new BidDto();

        bidDto.bidId = bid.bidId;
        bidDto.rentalPostId = bid.rentalPostId;
        bidDto.bidderAddress = bid.bidderAddress;
        bidDto.message = bid.message || undefined;
        bidDto.hourlyRate = bid.hourlyRate;
        bidDto.rentalDuration = bid.rentalDuration;
        bidDto.isAccepted = bid.isAccepted;
        bidDto.acceptedTimestamp = bid.acceptedTimestamp || undefined;
        bidDto.createdAt = bid.createdAt;
        bidDto.updatedAt = bid.updatedAt || undefined;

        return bidDto;
    }
}
