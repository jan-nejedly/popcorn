import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Res,
  Session,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('login')
  @Public()
  @Render('login')
  getLogin(@Query('error') error: string): object {
    return { title: 'Login', error };
  }

  @Post('login')
  @Public()
  async login(
    @Body('name') name: string,
    @Body('password') password: string,
    @Session() session: any,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.login(name, password);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      session.user = userWithoutPassword;

      return res.redirect('/movies');
    } catch (error) {
      return res.redirect('/users/login?error=Invalid credentials');
    }
  }

  @Get('register')
  @Public()
  @Render('register')
  getRegister(@Query('error') error: string): object {
    return { title: 'Register', error };
  }

  @Post('register')
  @Public()
  async register(
    @Body('name') name: string,
    @Body('password') password: string,
    @Body('passwordConfirm') passwordConfirm: string,
    @Session() session: any,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.register(
        name,
        password,
        passwordConfirm,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      session.user = userWithoutPassword;

      if (user) return res.redirect('/movies');

      res.redirect('/users/register');
    } catch (error) {
      if (error instanceof BadRequestException) {
        return res.redirect(`/users/register?error=${error.message}`);
      }

      return res.redirect('/users/register?error=Unexpected error');
    }
  }

  @Get('search')
  async search(@Query('s') name: string, @CurrentUser() user: any) {
    return this.usersService.searchByName(name, user.id);
  }

  @Get('logout')
  async logout(@Session() session: any, @Res() res: Response) {
    session.user = null;
    res.redirect('/users/login');
  }

  @Get('whoami')
  async whoAmI(@CurrentUser() user: any) {
    if (user.id) {
      const me = await this.usersService.findById(user.id);
      if (me) return me;
    }
    return null;
  }
}
