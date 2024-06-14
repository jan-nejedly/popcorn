import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { MoviesService } from './movies/movies.service';
import { UsersService } from './users/users.service';
import { FollowersService } from './followers/followers.service';
import { RatingsService } from './ratings/ratings.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/currentUser.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly moviesService: MoviesService,
    private readonly ratingsService: RatingsService,
    private readonly usersService: UsersService,
    private readonly followersService: FollowersService,
  ) {}

  @Get()
  @Render('index')
  async getHome(@CurrentUser() user: any): Promise<object> {
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

  @Get('movie/:imdbID')
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

  @Get('followers')
  @Render('followers')
  async getFollowers(@CurrentUser() user: any): Promise<object> {
    const totalFollowingStats =
      await this.followersService.getTotalStatsByUserId(user.id);
    const followersWithStats = await this.followersService.getAllByUserId(
      user.id,
    );
    return {
      title: 'Followers',
      currentUser: user,
      totalFollowingStats,
      followersWithStats,
    };
  }

  @Get('follower/:userId')
  @Render('follower')
  async getFollower(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ): Promise<object> {
    const id = Number(userId);

    const [
      user,
      ratedMovies,
      userMovStatistics,
      userFollStatistics,
      myMovStatistics,
      isFollowing,
    ] = await Promise.all([
      this.usersService.findById(id),
      this.moviesService.getAllWithStatisticsByUserId(id),
      this.usersService.getUserMoviesStatistics(id),
      this.usersService.getUserFollowersStatistics(id),
      this.usersService.getUserMoviesStatistics(currentUser.id),
      this.followersService.isFollowing(currentUser.id, id),
    ]);

    return {
      title: user ? user.name : 'Profile',
      user,
      currentUser,
      ratedMovies,
      userMovStatistics,
      userFollStatistics,
      myMovStatistics,
      isFollowing,
    };
  }

  @Get('login')
  @Public()
  @Render('login')
  getLogin(): object {
    return { title: 'Login' };
  }

  @Get('register')
  @Public()
  @Render('register')
  getRegister(): object {
    return { title: 'Register' };
  }
}
