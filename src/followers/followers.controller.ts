import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Redirect,
  Res,
  Session,
} from '@nestjs/common';
import { FollowersService } from './followers.service';
import { Response } from 'express';

@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body('followerId') followerId: number,
    @Session() session: any,
    @Res() res: Response,
  ) {
    await this.followersService.addFollowing(Number(session.userId), Number(followerId));
    res.redirect('/followers');
    return { success: true, message: 'Following sucessfully added.' };
  }

  @Get('delete/:followingId')
  @HttpCode(HttpStatus.OK)
  @Redirect('back', 302)
  async deleteFollowing(
    @Param('followingId') followingId: number,
  ): Promise<{ success: boolean }> {
    const deleted =
      await this.followersService.deleteFollowingById(followingId);
    return { success: deleted };
  }
}
