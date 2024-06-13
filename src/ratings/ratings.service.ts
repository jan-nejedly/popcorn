import { Injectable } from '@nestjs/common';
import { db } from '../db/db';
import { SelectRating, followersTable, moviesTable, ratingsTable, usersTable } from '../db/schema';
import { and, eq, sql, count } from 'drizzle-orm';

@Injectable()
export class RatingsService {
  async addRating(
    userId: number,
    movieId: number,
    stars: number,
  ): Promise<SelectRating[] | void> {
    const exist = await this.checkIfRatingExists(userId, movieId);

    if (exist) return;

    return await db.insert(ratingsTable).values({ userId, movieId, stars });
  }

  async checkIfRatingExists(userId: number, movieId: number): Promise<boolean> {
    const existingRating = await db
      .select()
      .from(ratingsTable)
      .where(
        and(eq(ratingsTable.userId, userId), eq(ratingsTable.movieId, movieId)),
      )
      .limit(1);
    return !!existingRating.length;
  }

  async getRating(
    userId: number,
    movieId: number,
  ): Promise<SelectRating | null> {
    const rating = await db
      .select()
      .from(ratingsTable)
      .where(
        and(eq(ratingsTable.userId, userId), eq(ratingsTable.movieId, movieId)),
      )
      .limit(1);

    return rating.length > 0 ? rating[0] : null;
  }

  async deleteRating(ratingId: number): Promise<boolean> {
    const ratingExists = await db
      .select()
      .from(ratingsTable)
      .where(eq(ratingsTable.id, ratingId));

    if (ratingExists.length > 0) {
      await db.delete(ratingsTable).where(eq(ratingsTable.id, ratingId));
      return true;
    } else {
      return false;
    }
  }

  async getAllOfFollowersPerMovie(userId: number, imdbId: string): Promise<any> {
    const followersRatings = await db
      .select({
        followerId: followersTable.followerId,
        followerName: usersTable.name,
        stars: ratingsTable.stars,
        totalCountRatedMovies: sql`(
          SELECT COUNT(*) 
          FROM ${ratingsTable} 
          WHERE ${ratingsTable.userId} = ${followersTable.followerId})`
      })
      .from(followersTable)
      .innerJoin(usersTable, eq(followersTable.followerId, usersTable.id))
      .innerJoin(ratingsTable, eq(followersTable.followerId, ratingsTable.userId))
      .innerJoin(moviesTable, eq(ratingsTable.movieId, moviesTable.id))
      .where(
        and(
          eq(followersTable.userId, userId),
          eq(moviesTable.imdbID, imdbId)
      ));

    return followersRatings;
  }

  async getTotalOfFollowersPerMovie(userId: number, imdbId: string): Promise<any> {
    const followersCountAndAvgStars = await db
      .select({
        followersCount: count(followersTable.followerId).as('followers_count'),
        avgStars: sql`COALESCE(ROUND(AVG(${ratingsTable.stars}), 1), 0) AS avg_stars`
      })
      .from(followersTable)
      .innerJoin(ratingsTable, eq(followersTable.followerId, ratingsTable.userId))
      .innerJoin(moviesTable, eq(ratingsTable.movieId, moviesTable.id))
      .where(
        and(
          eq(followersTable.userId, userId),
          eq(moviesTable.imdbID, imdbId)
      ));
      
    return followersCountAndAvgStars[0];
  }
}
