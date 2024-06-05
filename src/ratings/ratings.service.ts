import { Injectable } from '@nestjs/common';
import { db } from '../db/db';
import { SelectRating, ratingsTable } from '../db/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class RatingsService {
    async addRating(userId: number, movieId: number, stars: number): Promise<SelectRating[] | void> {
        const exist = await this.checkIfRatingExists(userId, movieId);
        
        if (exist) return;

        return await db.insert(ratingsTable).values({userId, movieId, stars});
    }

    async checkIfRatingExists(userId: number, movieId: number): Promise<boolean> {
        const existingRating = await db
            .select()
            .from(ratingsTable)
            .where(and(eq(ratingsTable.userId, userId), eq(ratingsTable.movieId, movieId)))
            .limit(1);
        return !!existingRating.length;
    }
}
