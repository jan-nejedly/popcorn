import { Injectable } from '@nestjs/common';
import { count, eq, sql } from 'drizzle-orm';
import { db } from 'src/db/db';
import { followersTable, userMovieStatistics, usersTable } from 'src/db/schema';

@Injectable()
export class FollowersService {
  async deleteFollowingById(followingId: number): Promise<boolean> {
    const followingExists = await db
      .select()
      .from(followersTable)
      .where(eq(followersTable.id, followingId));

    if (followingExists.length > 0) {
      await db.delete(followersTable).where(eq(followersTable.id, followingId));
      return true;
    } else {
      return false;
    }
  }

  async getAllByUserId(userId: number): Promise<any> {
    const followersWithStats = await db
      .select({
        followingId: followersTable.id,
        userId: usersTable.id,
        userName: usersTable.name,
        totalRuntime: sql<number>`COALESCE(${userMovieStatistics.totalRuntime}, 0)`.as('total_runtime'),
        movieCount: sql<number>`COALESCE(${userMovieStatistics.movieCount}, 0)`.as('movie_count'),
        averageStars: sql<number>`COALESCE(${userMovieStatistics.averageStars}, 0)`.as('average_stars'),
      })
      .from(followersTable)
      .innerJoin(usersTable, eq(followersTable.followerId, usersTable.id))
      .innerJoin(userMovieStatistics, eq(followersTable.followerId, userMovieStatistics.userId))
      .where(eq(followersTable.userId, userId));
  
    return followersWithStats;
  }

  async getTotalStatsByUserId(userId: number): Promise<any> {
      const totalFollowingStats = await db
        .select({
          totalRuntime: sql<number>`COALESCE(SUM(${userMovieStatistics.totalRuntime}), 0)`.as('total_runtime'),
          movieCount: sql<number>`COALESCE(SUM(${userMovieStatistics.movieCount}), 0)`.as('movie_count'),
          averageStars: sql<number>`COALESCE(ROUND(AVG(${userMovieStatistics.averageStars}), 1), 0)`.as('average_stars'),
          followersCount: count(followersTable.followerId)
        })
        .from(followersTable)
        .innerJoin(usersTable, eq(followersTable.followerId, usersTable.id))
        .innerJoin(userMovieStatistics, eq(followersTable.followerId, userMovieStatistics.userId))
        .where(eq(followersTable.userId, userId));
    
      return totalFollowingStats[0];
    }      
}
