import { config } from '@/config/env';
import { RentalPostDto, ResponseDto } from '@repo/shared-dtos';

export class RentalPostApiService {
    private API_BASE_URL: string;

    constructor() {
        this.API_BASE_URL = `${config.api.BASE_URL}/${config.api.VERSION}/rental-post`;
    }

    public async findAll(): Promise<ResponseDto<RentalPostDto[]>> {
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
