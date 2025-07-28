import { config } from '@/config/env';
import { logger } from '@/lib/logger';
import { CreateNftDto, NftDto, ResponseDto } from '@repo/shared-dtos';

export class NFTApiService {
  private API_BASE_URL: string;

  constructor() {
    this.API_BASE_URL = `${config.api.BASE_URL}/${config.api.VERSION}/nft`;
  }

  public async create(createNftDto: CreateNftDto): Promise<ResponseDto<NftDto>> {
    logger.info('Creating NFT:', createNftDto);

    try {
      const response = await fetch(`${this.API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createNftDto),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.data;
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw error;
    }
  }

  public async findAll(): Promise<ResponseDto<NftDto[]>> {
    logger.info('Fetching all NFTs');

    try {
      const response = await fetch(`${this.API_BASE_URL}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching NFTs:', error);

      throw error;
    }
  }

  public async findOne(id: number): Promise<ResponseDto<NftDto>> {
    logger.info('Fetching NFT by id:', id);

    try {
      const response = await fetch(`${this.API_BASE_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching NFT by address:', error);

      throw error;
    }
  }
}

export const nftApiService = new NFTApiService();
