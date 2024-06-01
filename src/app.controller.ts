import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
  Session,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MoviesService } from './movies/movies.service';
import { UsersService } from './users/users.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly moviesService: MoviesService,
    private readonly usersService: UsersService,
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

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Session() session: any,
    @Res() res: Response,
  ) {
    const user = await this.usersService.login(email, password);

    if (!user) throw new BadRequestException('Invalid email or password');

    session.userId = user.id;
    res.redirect('/');
  }

  @Get('register')
  @Render('register')
  getRegister(): object {
    return { title: 'Register' };
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('passwordConfirm') passwordConfirm: string,
    @Res() res: Response,
  ) {
    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.usersService.register(email, password);

    if (user) return res.redirect('/');

    res.redirect('/register');
  }

  @Get('logout')
  logout(@Session() session: any, @Res() res: Response) {
    session.userId = null;
    res.redirect('/login');
  }
}
