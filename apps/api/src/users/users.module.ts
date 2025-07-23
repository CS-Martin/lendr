import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersDbService } from './users.db.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersDbService],
  exports: [UsersService, UsersDbService],
})
export class UsersModule {}
