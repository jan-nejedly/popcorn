import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Redirect,
  Render,
} from '@nestjs/common';
import { FollowersService } from './followers.service';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { UsersService } from 'src/users/users.service';
import { MoviesService } from 'src/movies/movies.service';

@Controller('followers')
export class FollowersController {
  constructor(
    private readonly followersService: FollowersService,
    private readonly usersService: UsersService,
    private readonly moviesService: MoviesService,
  ) {}

  @Get()
  @Render('followers')
  async getFollowers(@CurrentUser() currentUser: any): Promise<object> {
    const [totalFollowingStats, followersWithStats] = await Promise.all([
      this.followersService.getTotalStatsByUserId(currentUser.id),
      this.followersService.getAllByUserId(currentUser.id),
    ]);

    return {
      title: 'Followers',
      currentUser,
      totalFollowingStats,
      followersWithStats,
    };
  }

  @Get(':userId')
  @Render('follower')
  async getFollower(
    @Param('userId', ParseIntPipe) id: number,
    @CurrentUser() currentUser: any,
  ): Promise<object> {
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
