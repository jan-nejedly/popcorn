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
  async getMovies(@CurrentUser() user: any): Promise<object> {
    const ratedMovies = await this.moviesService.getAllWithStatisticsByUserId(
      user.id,
    );
    const userMovStatistics = await this.usersService.getUserMoviesStatistics(
      user.id,
    );
    const userFollStatistics =
      await this.usersService.getUserFollowersStatistics(user.id);
    return {
      title: 'Movies',
      currentUser: user,
      ratedMovies: ratedMovies,
      userMovStatistics: userMovStatistics,
      userFollStatistics: userFollStatistics,
      OMDB_API_KEY: process.env.OMDB_API_KEY,
    };
  }

  @Get(':imdbID')
  @Render('movie')
  async getMovie(
    @Param('imdbID') imdbID: string,
    @CurrentUser() user: any,
  ): Promise<object> {
    const movie = await this.moviesService.findByImdbID(imdbID);
    const rating = await this.ratingsService.getRating(user.id, movie?.id);
    const followersRatingPerMovie =
      await this.ratingsService.getAllOfFollowersPerMovie(user.id, imdbID);
    const totalRatingPerMovie =
      await this.ratingsService.getTotalOfFollowersPerMovie(user.id, imdbID);

    return {
      title: movie ? movie.title : 'Movie',
      currentUser: user,
      movie,
      rating,
      followersRatingPerMovie,
      totalRatingPerMovie,
    };
  }
}
