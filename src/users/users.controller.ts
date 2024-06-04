import {
  Body,
  Controller,
  Get,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.usersService.register(email, password);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Session() session: any,
  ) {
    const user = await this.usersService.login(email, password);
    if (user) {
      session.userId = user.id;
      return user;
    }
    return null;
  }

  @Post('logout')
  async logout(@Session() session: any) {
    session.userId = null;
    return { message: 'Logged out' };
  }

  @Get('whoami')
  @UseGuards(AuthGuard)
  async whoAmI(@Session() session: any) {
    if (session.userId) {
      const user = await this.usersService.findById(session.userId);
      if (user) {
        return user;
      }
    }
    return null;
  }
}
