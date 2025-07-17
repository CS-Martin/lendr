import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TransactionHashService } from './transaction-hash.service';
import {
  CreateTransactionHashDto,
  FilterTransactionHashDto,
} from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Transaction Hashes')
@Controller({ path: 'transaction-hash', version: '1' })
export class TransactionHashController {
  constructor(private readonly transactionHashService: TransactionHashService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction hash' })
  @ApiResponse({ status: 201, description: 'Transaction hash created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or rental ID not found' })
  create(@Body() createTransactionHashDto: CreateTransactionHashDto) {
    return this.transactionHashService.create(createTransactionHashDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transaction hashes with optional filters' })
  @ApiResponse({ status: 200, description: 'Transaction hashes retrieved successfully' })
  findAll(@Query() filters: FilterTransactionHashDto) {
    return this.transactionHashService.find(filters);
  }

  @Get(':hash')
  @ApiOperation({ summary: 'Get a transaction hash by hash' })
  @ApiResponse({ status: 200, description: 'Transaction hash found' })
  @ApiResponse({ status: 404, description: 'Transaction hash not found' })
  findOne(@Param('hash') hash: string) {
    return this.transactionHashService.findOne(hash);
  }

  @Delete(':hash')
  @ApiOperation({ summary: 'Delete a transaction hash by hash' })
  @ApiResponse({ status: 200, description: 'Transaction hash deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction hash not found' })
  remove(@Param('hash') hash: string) {
    return this.transactionHashService.remove(hash);
  }
}
