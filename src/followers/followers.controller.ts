import { Controller, Get, HttpCode, HttpStatus, Param, Redirect } from '@nestjs/common';
import { FollowersService } from './followers.service';

@Controller('followers')
export class FollowersController {
    constructor(private readonly followersService: FollowersService) {}

    @Get('delete/:followingId')
    @HttpCode(HttpStatus.OK)
    @Redirect('back', 302)
    async deleteFollowing(@Param('followingId') followingId: number): Promise<{ success: boolean }> {
        const deleted = await this.followersService.deleteFollowingById(followingId);
        return { success: deleted };
    }
}
