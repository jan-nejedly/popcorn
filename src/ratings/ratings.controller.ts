import { Body, Controller, HttpCode, HttpStatus, Post, Session } from '@nestjs/common';
import { RatingsService } from './ratings.service';

@Controller('ratings')
export class RatingsController {
    constructor(private readonly ratingsService: RatingsService) {}

    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    async add(
        @Body('stars') stars: number,
        @Body('movieId') movieId: number,
        @Session() session: any
    ) {
        await this.ratingsService.addRating(Number(session.userId), movieId, stars);
        return { success: true, message: 'Rating sucessfully added.' };
    }
}
