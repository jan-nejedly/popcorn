import { Injectable } from '@nestjs/common';
import { and, count, eq, sql } from 'drizzle-orm';
import { db } from 'src/db/db';
import { followersTable, userMovieStatistics, usersTable } from 'src/db/schema';

@Injectable()
export class FollowersService {
  async isFollowing(userId: number, followerId: number): Promise<boolean> {
    const following = await db
      .select()
      .from(followersTable)
      .where(
        and(
          eq(followersTable.userId, userId),
          eq(followersTable.followerId, followerId),
        ),
      );

    return following.length > 0;
  }

  async addFollowing(userId: number, followerId: number): Promise<boolean> {
    if (await this.isFollowing(userId, followerId)) return false;

    await db.insert(followersTable).values({ userId, followerId });

    return true;
  }

  async removeFollowing(userId: number, followerId: number): Promise<boolean> {
    if (!(await this.isFollowing(userId, followerId))) return true;

    await db
      .delete(followersTable)
      .where(
        and(
          eq(followersTable.userId, userId),
          eq(followersTable.followerId, followerId),
        ),
      );

    return true;
  }

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
        totalRuntime:
          sql<number>`COALESCE(${userMovieStatistics.totalRuntime}, 0)`.as(
            'total_runtime',
          ),
        movieCount:
          sql<number>`COALESCE(${userMovieStatistics.movieCount}, 0)`.as(
            'movie_count',
          ),
        averageStars:
          sql<number>`COALESCE(${userMovieStatistics.averageStars}, 0)`.as(
            'average_stars',
          ),
      })
      .from(followersTable)
      .innerJoin(usersTable, eq(followersTable.followerId, usersTable.id))
      .innerJoin(
        userMovieStatistics,
        eq(followersTable.followerId, userMovieStatistics.userId),
      )
      .where(eq(followersTable.userId, userId));

    return followersWithStats;
  }

  async getTotalStatsByUserId(userId: number): Promise<any> {
    const totalFollowingStats = await db
      .select({
        totalRuntime:
          sql<number>`COALESCE(SUM(${userMovieStatistics.totalRuntime}), 0)`.as(
            'total_runtime',
          ),
        movieCount:
          sql<number>`COALESCE(SUM(${userMovieStatistics.movieCount}), 0)`.as(
            'movie_count',
          ),
        averageStars:
          sql<number>`COALESCE(ROUND(AVG(${userMovieStatistics.averageStars}), 1), 0)`.as(
            'average_stars',
          ),
        followersCount: count(followersTable.followerId),
      })
      .from(followersTable)
      .innerJoin(usersTable, eq(followersTable.followerId, usersTable.id))
      .innerJoin(
        userMovieStatistics,
        eq(followersTable.followerId, userMovieStatistics.userId),
      )
      .where(eq(followersTable.userId, userId));

    return totalFollowingStats[0];
  }
}
