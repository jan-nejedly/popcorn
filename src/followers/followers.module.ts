import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { UsersModule } from 'src/users/users.module';
import { MoviesModule } from 'src/movies/movies.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [UsersModule, MoviesModule, NotificationsModule],
  providers: [FollowersService],
  controllers: [FollowersController],
  exports: [FollowersService],
})
export class FollowersModule {}
