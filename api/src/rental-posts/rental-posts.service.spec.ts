import { Test, TestingModule } from '@nestjs/testing';
import { RentalPostsService } from './rental-posts.service';

describe('RentalPostsService', () => {
    let service: RentalPostsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RentalPostsService],
        }).compile();

        service = module.get<RentalPostsService>(RentalPostsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
