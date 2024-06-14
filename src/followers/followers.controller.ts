import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { FollowersService } from './followers.service';

@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  @Redirect('/followers', 302)
  async addFollowing(
    @Body('userId') userId: number,
    @Body('followerId') followerId: number,
  ): Promise<{ success: boolean }> {
    const added = await this.followersService.addFollowing(userId, followerId);
    return { success: added };
  }

  @Post('remove')
  @HttpCode(HttpStatus.CREATED)
  @Redirect('/followers', 302)
  async removeFollowing(
    @Body('userId') userId: number,
    @Body('followerId') followerId: number,
  ): Promise<{ success: boolean }> {
    const removed = await this.followersService.removeFollowing(
      userId,
      followerId,
    );
    return { success: removed };
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
