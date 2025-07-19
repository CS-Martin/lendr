import { Test, TestingModule } from '@nestjs/testing';
import { TransactionHashService } from './transaction-hash.service';

describe('TransactionHashService', () => {
    let service: TransactionHashService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TransactionHashService],
        }).compile();

        service = module.get<TransactionHashService>(TransactionHashService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
