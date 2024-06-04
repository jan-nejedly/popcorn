import { Injectable } from '@nestjs/common';
import { db } from '../db/db';
import { ratingsTable } from '../db/schema';

@Injectable()
export class RatingsService {
    async addRating(userId: number, movieId: number, stars: number): Promise<any> {
        const rating = await db.insert(ratingsTable).values({userId, movieId, stars});
        return rating;
    }
}
