import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { UsersModule } from 'src/users/users.module';
import { RatingsModule } from 'src/ratings/ratings.module';

@Module({
  imports: [UsersModule, RatingsModule],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
