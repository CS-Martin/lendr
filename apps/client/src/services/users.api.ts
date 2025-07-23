import { config } from '@/config/env';
import { logger } from '@/lib/logger';
import { ResponseDto, UserDto } from '@repo/shared-dtos';

export class UserApiService {
    private API_BASE_URL: string;

    constructor() {
        this.API_BASE_URL = `${config.api.BASE_URL}/${config.api.VERSION}/user`;
    }

    public async create(user: UserDto): Promise<ResponseDto<UserDto>> {
        logger.info('Creating user:', user);

        try {
            const response = await fetch(`${this.API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating user:', error);

            throw error;
        }
    }

    public async findOne(address: string): Promise<ResponseDto<UserDto>> {
        logger.info('Fetching user by address:', address);

        try {
            const response = await fetch(`${this.API_BASE_URL}/${address}`);

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user:', error);

            throw error;
        }
    }

    public async findAll(): Promise<ResponseDto<UserDto[]>> {
        logger.info('Fetching all users');

        try {
            const response = await fetch(`${this.API_BASE_URL}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching users:', error);

            throw error;
        }
    }
}

export const userApiService = new UserApiService();
