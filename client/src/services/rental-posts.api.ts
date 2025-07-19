export class RentalPostApiService {
    private API_BASE_URL: string;

    constructor() {
        this.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
    }
}