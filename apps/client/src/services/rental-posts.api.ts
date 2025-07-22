import { config } from '@/config/env';
import { logger } from '@/lib/logger';
import { RentalPostDto, ResponseDto } from '@repo/shared-dtos';

export class RentalPostApiService {
    private API_BASE_URL: string;

    constructor() {
        this.API_BASE_URL = `${config.api.BASE_URL}/${config.api.VERSION}/rental-post`;
    }

    public async create(rentalPost: RentalPostDto): Promise<ResponseDto<RentalPostDto>> {
        logger.info('Creating rental post:', rentalPost);

        try {
            const response = await fetch(`${this.API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentalPost),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating rental post:', error);
            throw error;
        }
    }

    public async findAll(): Promise<ResponseDto<RentalPostDto[]>> {
        logger.info('Fetching all rental posts');

        try {
            const response = await fetch(`${this.API_BASE_URL}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching rental posts:', error);

            throw error;
        }
    }
}

export const rentalPostApiService = new RentalPostApiService();
