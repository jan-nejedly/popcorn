import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
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

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  async search(@Query('s') name: string, @CurrentUser() user: any) {
    return this.usersService.searchByName(name, user.id);
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
    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.usersService.register(name, password);

    const { password: _, ...userWithoutPassword } = user;
    session.user = userWithoutPassword;

    if (user) return res.redirect('/');

    res.redirect('/register');
  }

  @Post('login')
  @Public()
  async login(
    @Body('name') name: string,
    @Body('password') password: string,
    @Session() session: any,
    @Res() res: Response,
  ) {
    const user = await this.usersService.login(name, password);

    if (!user) throw new BadRequestException('Invalid name or password');

    const { password: _, ...userWithoutPassword } = user;
    session.user = userWithoutPassword;

    return res.redirect('/');
  }

  @Get('logout')
  async logout(@Session() session: any, @Res() res: Response) {
    session.user = null;
    res.redirect('/login');
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
