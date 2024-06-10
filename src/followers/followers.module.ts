import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';

@Module({
  providers: [FollowersService],
  controllers: [FollowersController],
  exports: [FollowersService],
})
export class FollowersModule {}
