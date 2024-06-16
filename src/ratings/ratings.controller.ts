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
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { Response } from 'express';
import { CurrentUser } from 'src/decorators/currentUser.decorator';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body('stars') stars: number,
    @Body('movieId') movieId: number,
    @CurrentUser() currentUser: any,
    @Res() res: Response,
  ) {
    await this.ratingsService.addRating(currentUser.id, movieId, stars);
    res.redirect('/movies');
    return { success: true, message: 'Rating sucessfully added.' };
  }

  @Get('delete/:ratingId')
  @HttpCode(HttpStatus.OK)
  @Redirect('back', 302)
  async deleteRating(
    @Param('ratingId') ratingId: number,
  ): Promise<{ success: boolean }> {
    const deleted = await this.ratingsService.deleteRating(ratingId);
    return { success: deleted };
  }
}
