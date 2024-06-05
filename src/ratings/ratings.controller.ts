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
import { RatingsService } from './ratings.service';
import { Response } from 'express';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Body('stars') stars: number,
    @Body('movieId') movieId: number,
    @Session() session: any,
    @Res() res: Response,
  ) {
    await this.ratingsService.addRating(Number(session.userId), movieId, stars);
    res.redirect('/');
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
