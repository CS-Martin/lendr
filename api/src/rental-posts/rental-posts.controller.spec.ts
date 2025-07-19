import { Test, TestingModule } from '@nestjs/testing';
import { RentalPostsController } from './rental-posts.controller';
import { RentalPostsService } from './rental-posts.service';

describe('RentalPostsController', () => {
    let controller: RentalPostsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RentalPostsController],
            providers: [RentalPostsService],
        }).compile();

        controller = module.get<RentalPostsController>(RentalPostsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
