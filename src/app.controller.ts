import { Controller, Get, Param, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { MoviesService } from './movies/movies.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly moviesService: MoviesService,
  ) {}

  @Get()
  @Render('index')
  getHome(): object {
    return { title: 'Movies', OMDB_API_KEY: process.env.OMDB_API_KEY };
  }

  @Get('movie/:imdbID')
  @Render('movie')
  async getMovie(@Param('imdbID') imdbID: string): Promise<object> {
    const movie = await this.moviesService.findByImdbID(imdbID);
    return {
      title: movie ? movie.title : 'Movie',
      movie,
    };
  }

  @Get('friends')
  @Render('friends')
  getFriends(): object {
    return { title: 'Friends' };
  }

  @Get('login')
  @Render('login')
  getLogin(): object {
    return { title: 'Login' };
  }

  @Get('register')
  @Render('register')
  getRegister(): object {
    return { title: 'Register' };
  }
}
