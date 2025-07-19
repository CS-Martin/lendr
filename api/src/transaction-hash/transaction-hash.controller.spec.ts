import { Test, TestingModule } from '@nestjs/testing';
import { TransactionHashController } from './transaction-hash.controller';
import { TransactionHashService } from './transaction-hash.service';

describe('TransactionHashController', () => {
    let controller: TransactionHashController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionHashController],
            providers: [TransactionHashService],
        }).compile();

        controller = module.get<TransactionHashController>(
            TransactionHashController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
