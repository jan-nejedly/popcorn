import { Controller, Get, Param, Render } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { UsersService } from 'src/users/users.service';
import { RatingsService } from 'src/ratings/ratings.service';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly usersService: UsersService,
    private readonly ratingsService: RatingsService,
  ) {}

  @Get()
  @Render('movies')
  async getMovies(@CurrentUser() currentUser: any): Promise<object> {
    const [ratedMovies, userMovStatistics, userFollStatistics] =
      await Promise.all([
        this.moviesService.getAllWithStatisticsByUserId(currentUser.id),
        this.usersService.getUserMoviesStatistics(currentUser.id),
        this.usersService.getUserFollowersStatistics(currentUser.id),
      ]);

    return {
      title: 'Movies',
      currentUser,
      ratedMovies,
      userMovStatistics,
      userFollStatistics,
      OMDB_API_KEY: process.env.OMDB_API_KEY,
    };
  }

  @Get(':imdbID')
  @Render('movie')
  async getMovie(
    @Param('imdbID') imdbID: string,
    @CurrentUser() currentUser: any,
  ): Promise<object> {
    const movie = await this.moviesService.findByImdbID(imdbID);
    const [rating, followersRating, totalRating] = await Promise.all([
      this.ratingsService.getRating(currentUser.id, movie?.id),
      this.ratingsService.getAllOfFollowersPerMovie(currentUser.id, imdbID),
      this.ratingsService.getTotalOfFollowersPerMovie(currentUser.id, imdbID),
    ]);

    return {
      title: movie?.title || 'Movie',
      currentUser,
      movie,
      rating,
      followersRatingPerMovie: followersRating,
      totalRatingPerMovie: totalRating,
    };
  }
}
